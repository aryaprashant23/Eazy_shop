/**
 * Orders Routes — /api/orders
 * Phase 5: Checkout, Payment processing (Mock), and Receipt generation.
 */
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { dbAll, dbGet, dbRun } = require('../database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// ─── GET /api/orders ───────────────────────────────────
// Fetch purchase history for the logged-in customer (Phase 7)
router.get('/', async (req, res, next) => {
    try {
        const orders = await dbAll('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', [req.user.id]);
        res.json({ success: true, data: orders });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/orders ──────────────────────────────────
// Convert active cart into a PENDING order
router.post('/', async (req, res, next) => {
    try {
        const userId = req.user.id;

        // 1. Get cart items
        const sql = `
            SELECT c.id as cartItemId, c.quantity, p.* 
            FROM cart_items c
            JOIN products p ON c.productId = p.id
            WHERE c.userId = ?
        `;
        const items = await dbAll(sql, [userId]);

        if (items.length === 0) {
            return res.status(400).json({ success: false, error: { message: 'Cart is empty.' } });
        }

        // 2. Check stock one last time and calculate total
        let totalAmount = 0;
        const orderItems = [];

        for (let item of items) {
            if (item.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    error: { message: `Not enough stock for ${item.name}. Available: ${item.stock}` } 
                });
            }
            totalAmount += item.discountedPrice * item.quantity;
            orderItems.push({
                productId: item.id,
                name: item.name,
                price: item.discountedPrice,
                quantity: item.quantity
            });
        }

        // 3. Create Order
        const orderId = 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        
        await dbRun(
            'INSERT INTO orders (id, userId, items, totalAmount, status) VALUES (?, ?, ?, ?, ?)',
            [orderId, userId, JSON.stringify(orderItems), totalAmount, 'PENDING']
        );

        res.status(201).json({
            success: true,
            data: {
                orderId,
                totalAmount,
                items: orderItems,
                status: 'PENDING'
            }
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/orders/:id/pay ──────────────────────────
// Mock payment processing. Marks order PAID and deducts inventory.
router.post('/:id/pay', async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { paymentMethod } = req.body; // e.g. UPI, Card

        const order = await dbGet('SELECT * FROM orders WHERE id = ? AND userId = ?', [orderId, req.user.id]);
        if (!order) return res.status(404).json({ success: false, error: { message: 'Order not found.' } });
        if (order.status === 'PAID') return res.status(400).json({ success: false, error: { message: 'Order is already paid.' } });

        const items = JSON.parse(order.items);

        // 1. Deduct Inventory (Phase 5.2)
        for (let item of items) {
            // Verify stock again just to be safe
            const product = await dbGet('SELECT stock FROM products WHERE id = ?', [item.productId]);
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, error: { message: `Stock unavailable for ${item.name}` } });
            }
            await dbRun('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId]);
        }

        // 2. Mark as PAID
        await dbRun("UPDATE orders SET status = 'PAID' WHERE id = ?", [orderId]);

        // 3. Clear User's Cart
        await dbRun('DELETE FROM cart_items WHERE userId = ?', [req.user.id]);

        // 4. Generate Exit QR String
        const exitQrCode = `QR-${orderId}`;

        // Return Digital Receipt
        res.json({
            success: true,
            message: 'Payment successful.',
            data: {
                receipt: {
                    orderId,
                    date: new Date().toISOString(),
                    items,
                    totalAmount: order.totalAmount,
                    paymentMethod: paymentMethod || 'Unknown'
                },
                exitQrCode
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
