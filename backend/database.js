const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error connecting to PostgreSQL:', err.message);
    } else {
        console.log('✅ Connected to Supabase PostgreSQL');
        release();
    }
});

/**
 * Initialize all database tables for PostgreSQL.
 */
async function initializeDatabase() {
    try {
        // ── Products Table ──
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id          TEXT PRIMARY KEY,
                name        TEXT NOT NULL,
                price       REAL NOT NULL,
                discountedPrice REAL,
                weight      TEXT,
                imageUrl    TEXT,
                category    TEXT,
                stock       INTEGER DEFAULT 0,
                createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ── Users Table ──
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id          SERIAL PRIMARY KEY,
                name        TEXT NOT NULL,
                email       TEXT UNIQUE NOT NULL,
                password    TEXT NOT NULL,
                role        TEXT DEFAULT 'customer',
                createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ── Orders Table ──
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id          TEXT PRIMARY KEY,
                userId      INTEGER REFERENCES users(id),
                items       TEXT,
                totalAmount REAL NOT NULL,
                status      TEXT DEFAULT 'PENDING',
                createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ── Cart Items Table ──
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id          SERIAL PRIMARY KEY,
                userId      INTEGER NOT NULL REFERENCES users(id),
                productId   TEXT NOT NULL REFERENCES products(id),
                quantity    INTEGER DEFAULT 1
            )
        `);

        console.log('✅ Database tables initialized (products, users, orders, cart_items)');
    } catch (err) {
        console.error('❌ Table initialization failed:', err);
        throw err;
    }
}

// ── SQLite to Postgres Converter Helper ──
// Converts "SELECT * FROM users WHERE id = ?" to "SELECT * FROM users WHERE id = $1"
function convertSql(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
}

// ── Postgres Column Case Fixer ──
// PostgreSQL folds unquoted column names to lowercase. This breaks the frontend which expects camelCase.
function restoreCamelCase(row) {
    if (!row) return row;
    const keyMap = {
        'discountedprice': 'discountedPrice',
        'imageurl': 'imageUrl',
        'userid': 'userId',
        'cartitemid': 'cartItemId',
        'totalamount': 'totalAmount',
        'createdat': 'createdAt',
        'productid': 'productId',
        'totalvisits': 'totalVisits',
        'lifetimespent': 'lifetimeSpent',
        'monthlyspent': 'monthlySpent',
        'joinedat': 'joinedAt'
    };
    const newRow = {};
    for (const key in row) {
        newRow[keyMap[key] || key] = row[key];
    }
    return newRow;
}

// ── Helper: dbAll ──
async function dbAll(sql, params = []) {
    const pgSql = convertSql(sql);
    const result = await pool.query(pgSql, params);
    return result.rows.map(restoreCamelCase);
}

// ── Helper: dbGet ──
async function dbGet(sql, params = []) {
    const pgSql = convertSql(sql);
    const result = await pool.query(pgSql, params);
    return restoreCamelCase(result.rows[0]);
}

// ── Helper: dbRun ──
async function dbRun(sql, params = []) {
    let pgSql = convertSql(sql);
    
    // Postgres requires RETURNING id to get the last inserted ID.
    if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
        pgSql = pgSql.replace(/;?$/, ' RETURNING id');
    }

    const result = await pool.query(pgSql, params);
    
    return { changes: result.rowCount, lastID: result.rows[0]?.id || 0 };
}

// We map `db` to `pool` just in case someone references db directly.
module.exports = { db: pool, initializeDatabase, dbAll, dbGet, dbRun };
