const { body, validationResult } = require('express-validator');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Sanitize string input
const sanitizeInput = (value) => {
    if (typeof value !== 'string') return value;
    // Remove any HTML tags and sanitize
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }).trim();
};

// Order validation rules
const validateOrder = [
    body('items')
        .isArray({ min: 1 })
        .withMessage('Order must contain at least one item'),
    body('items.*.name')
        .trim()
        .isIn(['Ethiopia', 'Guatemala', 'Nicaragua', 'Vagabond', 'Decaf'])
        .withMessage('Invalid product name'),
    body('items.*.quantity')
        .isInt({ min: 1, max: 100 })
        .withMessage('Quantity must be between 1 and 100'),
    body('customerEmail')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('customerName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .customSanitizer(sanitizeInput)
        .matches(/^[a-zA-Z\s\-']+$/)
        .withMessage('Name must contain only letters, spaces, hyphens, and apostrophes'),
    handleValidationErrors
];

// Payment processing validation
const validatePayment = [
    body('items')
        .isArray({ min: 1 })
        .withMessage('Order must contain at least one item'),
    body('items.*.name')
        .trim()
        .isIn(['Ethiopia', 'Guatemala', 'Nicaragua', 'Vagabond', 'Decaf'])
        .withMessage('Invalid product name'),
    body('items.*.quantity')
        .isInt({ min: 1, max: 100 })
        .withMessage('Quantity must be between 1 and 100'),
    body('customerEmail')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('customerName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .customSanitizer(sanitizeInput)
        .matches(/^[a-zA-Z\s\-']+$/)
        .withMessage('Name must contain only letters, spaces, hyphens, and apostrophes'),
    body('paypalOrderId')
        .trim()
        .matches(/^[A-Z0-9]{17}$/)
        .withMessage('Invalid PayPal order ID'),
    body('shippingCost')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Invalid shipping cost'),
    handleValidationErrors
];

// Stock update validation (for admin endpoints)
const validateStockUpdate = [
    body('stock_quantity')
        .isInt({ min: 0, max: 10000 })
        .withMessage('Stock quantity must be between 0 and 10000'),
    handleValidationErrors
];

module.exports = {
    validateOrder,
    validatePayment,
    validateStockUpdate,
    sanitizeInput
};