/**
 * server.js — Eazy Shop Backend Entry Point
 * 
 * Phase 1: Foundation
 * - Express server with CORS + JSON middleware
 * - SQLite database with tables: products, users, orders
 * - Modular route files mounted under /api/*
 * - Centralized error handling
 * - Health-check endpoint
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// ── Route Imports ──
const productRoutes = require('./routes/products');
const authRoutes    = require('./routes/auth');
const cartRoutes    = require('./routes/cart');
const orderRoutes   = require('./routes/orders');
const adminRoutes   = require('./routes/admin');
const inventoryRoutes = require('./routes/inventory');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Global Middleware ──
app.use(cors());
app.use(express.json());

// ── Request Logger (dev) ──
app.use((req, res, next) => {
    console.log(`→ ${req.method} ${req.url}`);
    next();
});

// ═══════════════════════════════════════
//   API Routes
// ═══════════════════════════════════════

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Eazy Shop Backend is running 🚀',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// Mount route modules
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/ai',       require('./routes/ai')); // Phase 7

// ── Error Handling ──
app.use(notFoundHandler);
app.use(errorHandler);

// ═══════════════════════════════════════
//   Start Server
// ═══════════════════════════════════════

async function start() {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log('');
            console.log('═══════════════════════════════════════');
            console.log(`  Eazy Shop Backend`);
            console.log(`  http://localhost:${PORT}`);
            console.log(`  Health: http://localhost:${PORT}/api/health`);
            console.log('═══════════════════════════════════════');
            console.log('');
            console.log('Available API routes:');
            console.log('  GET    /api/health');
            console.log('  POST   /api/auth/register');
            console.log('  POST   /api/auth/login');
            console.log('  GET    /api/auth/me            (protected)');
            console.log('  GET    /api/products');
            console.log('  GET    /api/products/:barcode');
            console.log('  *      /api/cart/*              (Phase 4)');
            console.log('  *      /api/orders/*            (Phase 5)');
            console.log('  GET    /api/admin/stats');
            console.log('');
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

start();
