/**
 * Cart Routes — /api/cart
 * Phase 4: Manage the user's active shopping cart.
 */
const express = require('express');
const router = express.Router();
const { dbAll, dbGet, dbRun } = require('../database');
const { authenticate } = require('../middleware/auth');

// All cart routes require authentication
router.use(authenticate);

// ─── GET /api/cart ────────────────────────────────────
// Retrieve the current user's cart items with full product details
router.get('/', async (req, res, next) => {
    try {
        const sql = `
            SELECT 
                c.id as cartItemId, 
                c.quantity, 
                p.* 
            FROM cart_items c
            JOIN products p ON c.productId = p.id
            WHERE c.userId = ?
        `;
        const items = await dbAll(sql, [req.user.id]);
        
        // Calculate totals
        let subtotal = 0;
        let discountSavings = 0;
        
        items.forEach(item => {
            const originalTotal = item.price * item.quantity;
            const finalTotal = item.discountedPrice * item.quantity;
            subtotal += finalTotal;
            if (item.price > item.discountedPrice) {
                discountSavings += (item.price - item.discountedPrice) * item.quantity;
            }
        });

        res.json({
            success: true,
            data: {
                items,
                summary: {
                    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
                    subtotal,
                    discountSavings
                }
            }
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/cart/add ────────────────────────────────
// Add a product to the cart (or increment quantity if it exists)
router.post('/add', async (req, res, next) => {
    try {
        const { barcode } = req.body;
        if (!barcode) {
            return res.status(400).json({ success: false, error: { message: 'Barcode is required.' } });
        }

        // 1. Verify product exists and has stock
        const product = await dbGet('SELECT * FROM products WHERE id = ?', [barcode]);
        if (!product) {
            return res.status(404).json({ success: false, error: { message: 'Product not found.' } });
        }
        if (product.stock <= 0) {
            return res.status(400).json({ success: false, error: { message: 'Product is out of stock.' } });
        }

        // 2. Check if already in cart
        const existingItem = await dbGet(
            'SELECT id, quantity FROM cart_items WHERE userId = ? AND productId = ?', 
            [req.user.id, barcode]
        );

        if (existingItem) {
            // Check stock limits
            if (existingItem.quantity >= product.stock) {
                return res.status(400).json({ success: false, error: { message: 'Cannot add more. Not enough stock.' } });
            }
            // Increment quantity
            await dbRun(
                'UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?', 
                [existingItem.id]
            );
        } else {
            // Add new item
            await dbRun(
                'INSERT INTO cart_items (userId, productId, quantity) VALUES (?, ?, 1)', 
                [req.user.id, barcode]
            );
        }

        res.status(200).json({ success: true, message: 'Item added to cart.' });
    } catch (err) {
        next(err);
    }
});

// ─── PUT /api/cart/update ──────────────────────────────
// Update quantity for a specific cart item
router.put('/update', async (req, res, next) => {
    try {
        const { cartItemId, quantity } = req.body;
        if (!cartItemId || quantity === undefined) {
            return res.status(400).json({ success: false, error: { message: 'cartItemId and quantity are required.' } });
        }

        if (quantity <= 0) {
            // Remove item entirely
            await dbRun('DELETE FROM cart_items WHERE id = ? AND userId = ?', [cartItemId, req.user.id]);
        } else {
            // Check stock first
            const item = await dbGet(`
                SELECT c.quantity, p.stock 
                FROM cart_items c JOIN products p ON c.productId = p.id 
                WHERE c.id = ? AND c.userId = ?
            `, [cartItemId, req.user.id]);
            
            if (!item) return res.status(404).json({ success: false, error: { message: 'Cart item not found.' } });
            if (quantity > item.stock) return res.status(400).json({ success: false, error: { message: `Only ${item.stock} in stock.` } });

            await dbRun('UPDATE cart_items SET quantity = ? WHERE id = ? AND userId = ?', [quantity, cartItemId, req.user.id]);
        }

        res.json({ success: true, message: 'Cart updated.' });
    } catch (err) {
        next(err);
    }
});

// ─── DELETE /api/cart/remove/:cartItemId ───────────────
router.delete('/remove/:cartItemId', async (req, res, next) => {
    try {
        const { cartItemId } = req.params;
        await dbRun('DELETE FROM cart_items WHERE id = ? AND userId = ?', [cartItemId, req.user.id]);
        res.json({ success: true, message: 'Item removed from cart.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
