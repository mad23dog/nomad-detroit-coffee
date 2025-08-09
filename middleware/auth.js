const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Get JWT secret from environment or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Simple admin credentials (in production, store in database)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('changeme123', 10);

// Generate JWT token
const generateToken = (username) => {
    return jwt.sign(
        { username, isAdmin: true },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Verify JWT token middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Admin login endpoint
const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    // Check username
    if (username !== ADMIN_USERNAME) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(username);

    res.json({
        message: 'Login successful',
        token,
        expiresIn: '24h'
    });
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    authenticateToken(req, res, () => {
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    });
};

module.exports = {
    authenticateToken,
    requireAdmin,
    adminLogin,
    generateToken
};