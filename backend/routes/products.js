/**
 * Product Routes — /api/products
 */
const express = require('express');
const router = express.Router();
const { dbAll, dbGet, dbRun } = require('../database');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/products — List all products (optional ?category= filter)
router.get('/', async (req, res, next) => {
    try {
        const { category } = req.query;
        let sql = 'SELECT * FROM products';
        let params = [];

        if (category) {
            sql += ' WHERE category = ?';
            params.push(category);
        }

        sql += ' ORDER BY category, name';
        const products = await dbAll(sql, params);
        res.json({ success: true, count: products.length, data: products });
    } catch (err) {
        next(err);
    }
});

// GET /api/products/:barcode — Lookup product by barcode ID
router.get('/:barcode', async (req, res, next) => {
    try {
        const { barcode } = req.params;
        const product = await dbGet('SELECT * FROM products WHERE id = ?', [barcode]);

        if (!product) {
            const error = new Error(`Product not found for barcode: ${barcode}`);
            error.statusCode = 404;
            throw error;
        }

        res.json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
});

// POST /api/products — Create a new product (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const { id, name, price, discountedPrice, weight, imageUrl, category, stock } = req.body;
        
        if (!id || !name || price === undefined) {
            return res.status(400).json({ success: false, error: { message: 'Barcode ID, Name, and Price are required.' } });
        }

        const existing = await dbGet('SELECT id FROM products WHERE id = ?', [id]);
        if (existing) {
            return res.status(409).json({ success: false, error: { message: 'A product with this barcode already exists.' } });
        }

        await dbRun(
            'INSERT INTO products (id, name, price, discountedPrice, weight, imageUrl, category, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, price, discountedPrice || price, weight || '', imageUrl || '', category || 'Uncategorized', stock || 0]
        );

        const newProduct = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
        res.status(201).json({ success: true, data: newProduct });
    } catch (err) {
        next(err);
    }
});

// PUT /api/products/:barcode — Update a product (Admin only)
router.put('/:barcode', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const { barcode } = req.params;
        const { name, price, discountedPrice, weight, imageUrl, category, stock } = req.body;

        const product = await dbGet('SELECT * FROM products WHERE id = ?', [barcode]);
        if (!product) {
            return res.status(404).json({ success: false, error: { message: 'Product not found.' } });
        }

        await dbRun(
            'UPDATE products SET name = ?, price = ?, discountedPrice = ?, weight = ?, imageUrl = ?, category = ?, stock = ? WHERE id = ?',
            [
                name || product.name,
                price !== undefined ? price : product.price,
                discountedPrice !== undefined ? discountedPrice : product.discountedPrice,
                weight !== undefined ? weight : product.weight,
                imageUrl !== undefined ? imageUrl : product.imageUrl,
                category || product.category,
                stock !== undefined ? stock : product.stock,
                barcode
            ]
        );

        const updatedProduct = await dbGet('SELECT * FROM products WHERE id = ?', [barcode]);
        res.json({ success: true, data: updatedProduct });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/products/:barcode — Delete a product (Admin only)
router.delete('/:barcode', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const { barcode } = req.params;
        const product = await dbGet('SELECT * FROM products WHERE id = ?', [barcode]);
        if (!product) {
            return res.status(404).json({ success: false, error: { message: 'Product not found.' } });
        }

        await dbRun('DELETE FROM products WHERE id = ?', [barcode]);
        res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
