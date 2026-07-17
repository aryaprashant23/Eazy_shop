/**
 * auth.js — JWT Authentication & Role-Based Access Middleware
 * 
 * Usage:
 *   const { authenticate, authorize } = require('./middleware/auth');
 *   router.get('/protected', authenticate, handler);
 *   router.get('/admin-only', authenticate, authorize('admin'), handler);
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'eazyshop-prototype-secret-key-2026';
const JWT_EXPIRES_IN = '24h';

/**
 * Generate a JWT token for a user.
 */
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Middleware: Authenticate — verifies the JWT from the Authorization header.
 * Attaches `req.user` with the decoded token payload on success.
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: { message: 'Access denied. No token provided.' },
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: { message: 'Invalid or expired token.' },
        });
    }
}

/**
 * Middleware: Authorize — restricts access to users with a specific role.
 * Must be used AFTER `authenticate`.
 *
 * @param  {...string} roles — Allowed roles (e.g. 'admin', 'customer')
 */
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: { message: `Access denied. Required role: ${roles.join(' or ')}.` },
            });
        }
        next();
    };
}

module.exports = { generateToken, authenticate, authorize, JWT_SECRET };
