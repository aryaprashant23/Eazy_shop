/**
 * Admin Routes — /api/admin
 * Phase 6: Admin Dashboard & Exit Verification
 */
const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require auth and admin role
router.use(authenticate);
router.use(authorize('admin'));

// GET /api/admin/stats — Basic stats
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await dbGet(`
            SELECT 
                (SELECT COUNT(*) FROM orders) AS totalOrders,
                (SELECT COALESCE(SUM(totalAmount), 0) FROM orders WHERE status = 'PAID' OR status = 'VERIFIED') AS totalRevenue,
                (SELECT COUNT(*) FROM products) AS totalProducts,
                (SELECT COUNT(*) FROM products WHERE stock < 20) AS lowStockItems
        `);
        res.json({ success: true, data: stats });
    } catch (err) {
        next(err);
    }
});

// GET /api/admin/orders — Recent orders
router.get('/orders', async (req, res, next) => {
    try {
        const orders = await dbAll('SELECT * FROM orders ORDER BY createdAt DESC LIMIT 50');
        res.json({ success: true, data: orders });
    } catch (err) {
        next(err);
    }
});

// POST /api/admin/verify-exit — Verify a customer's Exit QR Code
router.post('/verify-exit', async (req, res, next) => {
    try {
        const { qrCode } = req.body;
        if (!qrCode || !qrCode.startsWith('QR-')) {
            return res.status(400).json({ success: false, error: { message: 'Invalid QR Code format.' } });
        }

        const orderId = qrCode.replace('QR-', '');
        const order = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);

        if (!order) {
            return res.status(404).json({ success: false, error: { message: 'Order not found.' } });
        }

        if (order.status === 'VERIFIED') {
            return res.status(400).json({ success: false, error: { message: 'This QR code has already been verified and used.' } });
        }

        if (order.status !== 'PAID') {
            return res.status(400).json({ success: false, error: { message: `Order status is ${order.status}. Payment required.` } });
        }

        // Mark as VERIFIED
        await dbRun("UPDATE orders SET status = 'VERIFIED' WHERE id = ?", [orderId]);

        res.json({ 
            success: true, 
            message: 'Exit Verified Successfully.',
            data: { orderId, totalAmount: order.totalAmount, items: JSON.parse(order.items) }
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/admin/customers — List all customers with their aggregated shopping data
router.get('/customers', async (req, res, next) => {
    try {
        const query = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.createdAt AS joinedAt,
                COUNT(CASE WHEN o.status = 'VERIFIED' THEN o.id END) AS totalVisits,
                COALESCE(SUM(CASE WHEN o.status IN ('PAID', 'VERIFIED') THEN o.totalAmount ELSE 0 END), 0) AS lifetimeSpent,
                COALESCE(SUM(CASE WHEN o.status IN ('PAID', 'VERIFIED') AND strftime('%Y-%m', o.createdAt) = strftime('%Y-%m', 'now') THEN o.totalAmount ELSE 0 END), 0) AS monthlySpent
            FROM users u
            LEFT JOIN orders o ON u.id = o.userId
            WHERE u.role = 'customer'
            GROUP BY u.id
            ORDER BY lifetimeSpent DESC
        `;
        const customers = await dbAll(query);
        res.json({ success: true, data: customers });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
