/**
 * Auth Routes — /api/auth
 * Phase 2: Registration, Login, and profile retrieval.
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { dbGet, dbRun } = require('../database');
const { generateToken, authenticate } = require('../middleware/auth');

// ─── POST /api/auth/register ───────────────────────────
// Create a new customer account.
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: { message: 'Name, email, and password are required.' },
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: { message: 'Password must be at least 6 characters.' },
            });
        }

        // Check if email already exists
        const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) {
            return res.status(409).json({
                success: false,
                error: { message: 'An account with this email already exists.' },
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user (default role: customer)
        const result = await dbRun(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'customer']
        );

        const user = { id: result.lastID, name, email, role: 'customer' };
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            data: { user, token },
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/auth/login ──────────────────────────────
// Authenticate with email and password. Returns a JWT.
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: { message: 'Email and password are required.' },
            });
        }

        // Find user
        const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: { message: 'Invalid email or password.' },
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: { message: 'Invalid email or password.' },
            });
        }

        const tokenPayload = { id: user.id, name: user.name, email: user.email, role: user.role };
        const token = generateToken(tokenPayload);

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                token,
            },
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/auth/me ──────────────────────────────────
// Get the current authenticated user's profile.
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const user = await dbGet(
            'SELECT id, name, email, role, createdAt FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: { message: 'User not found.' },
            });
        }

        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/auth/fix-admin (TEMPORARY FIX) ───────────
// Force resets the admin account if there are login issues.
router.get('/fix-admin', async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Delete any existing user with this email
        await dbRun("DELETE FROM users WHERE email = 'admin@eazyshop.com'");
        
        // Re-insert as admin
        await dbRun(
            `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
            ['Store Admin', 'admin@eazyshop.com', hashedPassword, 'admin']
        );
        
        res.send("✅ Admin account successfully reset! You can now log into the Admin panel with: <br><br>Email: <b>admin@eazyshop.com</b><br>Password: <b>admin123</b>");
    } catch (err) {
        next(err);
    }
});

module.exports = router;
