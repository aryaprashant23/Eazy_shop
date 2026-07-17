/**
 * errorHandler.js — Centralized error-handling middleware.
 * Must be registered AFTER all route handlers in Express.
 */

function errorHandler(err, req, res, next) {
    console.error(`❌ [${req.method}] ${req.originalUrl} →`, err.message);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
        },
    });
}

/**
 * notFoundHandler — Catches unmatched routes.
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: {
            message: `Route not found: ${req.method} ${req.originalUrl}`,
        },
    });
}

module.exports = { errorHandler, notFoundHandler };
