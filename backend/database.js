const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, process.env.DB_PATH || './shop.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    console.log(`✅ Connected to SQLite database at ${dbPath}`);
});

// Enable WAL mode for better concurrent read performance
db.run('PRAGMA journal_mode=WAL');

/**
 * Initialize all database tables.
 * Called once on server startup.
 */
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // ── Products Table ──
            db.run(`
                CREATE TABLE IF NOT EXISTS products (
                    id          TEXT PRIMARY KEY,
                    name        TEXT NOT NULL,
                    price       REAL NOT NULL,
                    discountedPrice REAL,
                    weight      TEXT,
                    imageUrl    TEXT,
                    category    TEXT,
                    stock       INTEGER DEFAULT 0,
                    createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // ── Users Table ──
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    name        TEXT NOT NULL,
                    email       TEXT UNIQUE NOT NULL,
                    password    TEXT NOT NULL,
                    role        TEXT DEFAULT 'customer',
                    createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // ── Orders Table ──
            db.run(`
                CREATE TABLE IF NOT EXISTS orders (
                    id          TEXT PRIMARY KEY,
                    userId      INTEGER,
                    items       TEXT,
                    totalAmount REAL NOT NULL,
                    status      TEXT DEFAULT 'PENDING',
                    createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (userId) REFERENCES users(id)
                )
            `);

            // ── Cart Items Table (Phase 4) ──
            db.run(`
                CREATE TABLE IF NOT EXISTS cart_items (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    userId      INTEGER NOT NULL,
                    productId   TEXT NOT NULL,
                    quantity    INTEGER DEFAULT 1,
                    FOREIGN KEY (userId) REFERENCES users(id),
                    FOREIGN KEY (productId) REFERENCES products(id)
                )
            `, (err) => {
                if (err) return reject(err);
                console.log('✅ Database tables initialized (products, users, orders, cart_items)');
                resolve();
            });
        });
    });
}

// ── Helper: Promisified db.all ──
function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// ── Helper: Promisified db.get ──
function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// ── Helper: Promisified db.run ──
function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

module.exports = { db, initializeDatabase, dbAll, dbGet, dbRun };
