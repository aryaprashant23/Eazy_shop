/**
 * Inventory Routes — /api/inventory
 * Phase 5: Inventory monitoring and low-stock alerts.
 */
const express = require('express');
const router = express.Router();
const { dbAll } = require('../database');
const { authenticate, authorize } = require('../middleware/auth');

// Only Admins can access inventory stats directly
router.use(authenticate);
router.use(authorize('admin'));

// ─── GET /api/inventory ────────────────────────────────
// Retrieve all products with stock information and low-stock flags
router.get('/', async (req, res, next) => {
    try {
        const threshold = parseInt(req.query.threshold) || 20;

        const sql = 'SELECT id, name, category, stock FROM products ORDER BY stock ASC';
        const products = await dbAll(sql);

        const inventory = products.map(p => ({
            ...p,
            isLowStock: p.stock < threshold
        }));

        res.json({
            success: true,
            data: {
                lowStockCount: inventory.filter(p => p.isLowStock).length,
                threshold,
                items: inventory
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
