/**
 * seed.js — Populates the database with 15 realistic supermarket products.
 * Run with: npm run seed
 */
const { db, initializeDatabase, dbGet, dbRun } = require('./database');

const PRODUCTS = [
    // ── Groceries (Baking & Cooking) ──
    { id: '8901058850603', name: 'Aashirvaad Whole Wheat Atta 5kg', price: 250.0, discountedPrice: 235.0, weight: '5kg', imageUrl: '/images/atta.png', category: 'Groceries', stock: 40 },
    { id: '8901725000040', name: 'Fortune Sunflower Oil 1L', price: 190.0, discountedPrice: 175.0, weight: '1L', imageUrl: '/images/oil.png', category: 'Groceries', stock: 60 },
    { id: '8901058000411', name: 'Pillsbury Maida (Refined Wheat)', price: 60.0, discountedPrice: 55.0, weight: '1kg', imageUrl: '/images/maida.png', category: 'Groceries', stock: 100 },
    { id: '8904043900224', name: 'Madhur Pure & Hygienic Sugar', price: 55.0, discountedPrice: 50.0, weight: '1kg', imageUrl: '/images/sugar.png', category: 'Groceries', stock: 120 },
    { id: '8901058001005', name: 'Hershey\'s Cocoa Powder', price: 200.0, discountedPrice: 190.0, weight: '225g', imageUrl: '/images/cocoa.png', category: 'Groceries', stock: 30 },
    { id: '8901030922857', name: 'Maggi Masala Noodles 70g', price: 14.00, discountedPrice: 14.00, weight: '70g', imageUrl: '/images/maggi.png', category: 'Groceries', stock: 120 },
    { id: '8901725183004', name: 'Tata Salt 1kg', price: 28.00, discountedPrice: 25.00, weight: '1kg', imageUrl: '/images/tata-salt.png', category: 'Groceries', stock: 200 },

    // ── Snacks ──
    { id: '8901491101662', name: 'Lays Classic Salted 52g', price: 20.00, discountedPrice: 20.00, weight: '52g', imageUrl: '/images/lays.png', category: 'Snacks', stock: 150 },
    { id: '8901491502054', name: 'Kurkure Masala Munch 90g', price: 20.00, discountedPrice: 20.00, weight: '90g', imageUrl: '/images/kurkure.png', category: 'Snacks', stock: 130 },
    { id: '7622210989123', name: 'Oreo Original Biscuit 120g', price: 30.00, discountedPrice: 30.00, weight: '120g', imageUrl: '/images/oreo.png', category: 'Snacks', stock: 110 },
    { id: '8901262150019', name: 'Amul Dark Chocolate', price: 100.0, discountedPrice: 95.0, weight: '150g', imageUrl: '/images/amul-choc.png', category: 'Snacks', stock: 50 },

    // ── Beverages ──
    { id: '5449000000996', name: 'Coca-Cola Can 300ml', price: 40.00, discountedPrice: 35.00, weight: '300ml', imageUrl: '/images/coca-cola.png', category: 'Beverages', stock: 90 },
    { id: '8902080700202', name: 'Paper Boat Aam Panna 200ml', price: 30.00, discountedPrice: 30.00, weight: '200ml', imageUrl: '/images/paperboat.png', category: 'Beverages', stock: 70 },
    { id: '8902080204043', name: 'Tata Tea Gold', price: 150.0, discountedPrice: 140.0, weight: '250g', imageUrl: '/images/tea.png', category: 'Beverages', stock: 80 },

    // ── Dairy ──
    { id: '8901030716607', name: 'Amul Taaza Toned Milk 500ml', price: 30.00, discountedPrice: 29.00, weight: '500ml', imageUrl: '/images/amul-milk.png', category: 'Dairy', stock: 50 },
    { id: '8901030793875', name: 'Amul Butter 100g', price: 56.00, discountedPrice: 52.00, weight: '100g', imageUrl: '/images/amul-butter.png', category: 'Dairy', stock: 45 },

    // ── Personal Care ──
    { id: '8901314010285', name: 'Dettol Original Soap 125g', price: 42.00, discountedPrice: 38.00, weight: '125g', imageUrl: '/images/dettol.png', category: 'Personal Care', stock: 160 },
    { id: '8901023020803', name: 'Colgate MaxFresh Toothpaste 150g', price: 99.00, discountedPrice: 89.00, weight: '150g', imageUrl: '/images/colgate.png', category: 'Personal Care', stock: 140 },
    { id: '8906002971619', name: 'Nivea Men Face Wash 100ml', price: 199.00, discountedPrice: 179.00, weight: '100ml', imageUrl: '/images/nivea.png', category: 'Personal Care', stock: 55 },
];

async function seed() {
    try {
        await initializeDatabase();

        const existing = await dbGet('SELECT COUNT(*) AS count FROM products');
        if (existing.count > 0) {
            console.log(`⚠️  Database already has ${existing.count} products. Clearing and re-seeding...`);
            await dbRun('DELETE FROM products');
        }

        for (const p of PRODUCTS) {
            await dbRun(
                `INSERT INTO products (id, name, price, discountedPrice, weight, imageUrl, category, stock)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.id, p.name, p.price, p.discountedPrice, p.weight, p.imageUrl, p.category, p.stock]
            );
        }

        console.log(`✅ Seeded ${PRODUCTS.length} products across ${[...new Set(PRODUCTS.map(p => p.category))].length} categories.`);
        console.log('   Categories:', [...new Set(PRODUCTS.map(p => p.category))].join(', '));

        // Seed a default admin user with hashed password
        const bcrypt = require('bcryptjs');
        const adminExists = await dbGet("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'");
        if (Number(adminExists.count) === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await dbRun(
                `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
                ['Store Admin', 'admin@eazyshop.com', hashedPassword, 'admin']
            );
            console.log('✅ Seeded default admin user (admin@eazyshop.com / admin123)');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
