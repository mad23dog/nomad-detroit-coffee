const crypto = require('crypto');

// Store CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map();

// Generate CSRF token
const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// CSRF middleware
const csrfProtection = (req, res, next) => {
    // Skip CSRF for GET requests and PayPal webhooks
    if (req.method === 'GET' || req.path.includes('/paypal/webhook')) {
        return next();
    }

    // Get token from header or body
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionId = req.session?.id || req.headers['x-session-id'];

    if (!sessionId || !token) {
        return res.status(403).json({ error: 'CSRF token missing' });
    }

    const storedToken = csrfTokens.get(sessionId);
    
    if (!storedToken || storedToken !== token) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    // Token is valid, continue
    next();
};

// Endpoint to get CSRF token
const getCSRFToken = (req, res) => {
    const sessionId = req.session?.id || crypto.randomBytes(16).toString('hex');
    const token = generateCSRFToken();
    
    // Store token (expires after 1 hour)
    csrfTokens.set(sessionId, token);
    setTimeout(() => csrfTokens.delete(sessionId), 3600000);

    res.json({ 
        csrfToken: token,
        sessionId: sessionId
    });
};

// Clean up expired tokens periodically
setInterval(() => {
    // In production, implement proper token expiration
    if (csrfTokens.size > 1000) {
        csrfTokens.clear();
    }
}, 3600000); // Every hour

module.exports = {
    csrfProtection,
    getCSRFToken,
    generateCSRFToken
};