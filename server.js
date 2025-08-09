const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// Security middleware with enhanced configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Required for PayPal
                "https://www.paypal.com",
                "https://www.paypalobjects.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https://www.paypal.com",
                "https://www.paypalobjects.com",
                "https://www.google.com"
            ],
            connectSrc: [
                "'self'",
                "https://api.paypal.com",
                "https://api-m.paypal.com",
                "https://www.paypal.com"
            ],
            frameSrc: [
                "'self'",
                "https://www.paypal.com",
                "https://www.google.com"
            ],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser and cookie parser
app.use(express.json());
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        maxAge: 3600000 // 1 hour
    }
}));

app.use(express.static('public'));

// CSRF token endpoint
const { getCSRFToken, csrfProtection } = require('./middleware/csrf');
app.get('/api/csrf-token', getCSRFToken);

// Auth routes
const { adminLogin } = require('./middleware/auth');
app.post('/api/admin/login', adminLogin);

// Apply CSRF protection to all POST, PUT, DELETE routes
app.use('/api', csrfProtection);

// Routes
app.use('/api/orders', require('./routes/orders'));
app.use('/api/products', require('./routes/products'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('./'));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });
}

// Initialize database
const db = require('./database/init');
db.initialize();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});