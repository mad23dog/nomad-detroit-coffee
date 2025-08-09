const { body, validationResult } = require('express-validator');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Sanitize string input
const sanitizeInput = (value) => {
    if (typeof value !== 'string') return value;
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }).trim();
};

module.exports = async function handler(req, res) {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Check if environment variables are set
        if (!process.env.POSTGRES_URL) {
            return res.status(500).json({ 
                error: 'Database not configured. Please add POSTGRES_URL environment variable in Vercel dashboard.' 
            });
        }

        const { Pool } = require('pg');
        const { v4: uuidv4 } = require('uuid');

        // Database connection
        const pool = new Pool({
            connectionString: process.env.POSTGRES_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        const client = await pool.connect();

        try {
            const { items, customerEmail, customerName, paypalOrderId, shippingCost = 5.00 } = req.body;
            
            // Validate inputs
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'No items in order' });
            }

            if (!customerName || !customerEmail) {
                return res.status(400).json({ error: 'Customer information missing' });
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(customerEmail)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }

            // Sanitize customer name
            const sanitizedCustomerName = sanitizeInput(customerName);
            if (sanitizedCustomerName.length < 2 || sanitizedCustomerName.length > 100) {
                return res.status(400).json({ error: 'Customer name must be between 2 and 100 characters' });
            }

            // Validate PayPal order ID format
            if (!paypalOrderId || !/^[A-Z0-9]{17}$/.test(paypalOrderId)) {
                return res.status(400).json({ error: 'Invalid PayPal order ID' });
            }

            // Validate allowed product names
            const allowedProducts = ['Ethiopia', 'Guatemala', 'Nicaragua', 'Vagabond', 'Decaf'];
            for (const item of items) {
                if (!allowedProducts.includes(item.name)) {
                    return res.status(400).json({ error: `Invalid product: ${item.name}` });
                }
                if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
                    return res.status(400).json({ error: 'Invalid quantity' });
                }
            }

            // Generate unique order ID
            const orderId = uuidv4();
            
            // Calculate total from items plus shipping
            let itemsTotal = 0;
            const orderItems = [];
            
            await client.query('BEGIN');

            for (const item of items) {
                // Verify product exists and has stock
                const productResult = await client.query(
                    'SELECT * FROM products WHERE name = $1 AND stock_quantity >= $2',
                    [item.name, item.quantity]
                );
                
                if (productResult.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ 
                        error: `Product ${item.name} not available in requested quantity` 
                    });
                }
                
                const product = productResult.rows[0];
                const itemTotal = product.price * item.quantity;
                itemsTotal += itemTotal;
                
                orderItems.push({
                    product_id: product.id,
                    product_name: product.name,
                    quantity: item.quantity,
                    price: product.price
                });
            }
            
            const total = itemsTotal + shippingCost;
            
            // Create completed order in database
            await client.query(
                'INSERT INTO orders (order_id, customer_email, customer_name, total_amount, shipping_amount, status, paypal_order_id, completed_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)',
                [orderId, customerEmail, sanitizedCustomerName, total, shippingCost, 'completed', paypalOrderId]
            );
            
            // Insert order items
            for (const item of orderItems) {
                await client.query(
                    'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES ($1, $2, $3, $4, $5)',
                    [orderId, item.product_id, item.product_name, item.quantity, item.price]
                );
            }

            // Update inventory
            for (const item of orderItems) {
                await client.query(
                    'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                    [item.quantity, item.product_id]
                );
            }

            await client.query('COMMIT');
            
            // Send basic email confirmation if email is configured
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                try {
                    const nodemailer = require('nodemailer');
                    const transporter = nodemailer.createTransporter({
                        host: process.env.EMAIL_HOST,
                        port: process.env.EMAIL_PORT,
                        secure: false,
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        }
                    });

                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: customerEmail,
                        subject: `Order Confirmation - Nomad Detroit Coffee #${orderId}`,
                        html: `
                            <h2>Order Confirmation</h2>
                            <p>Hi ${sanitizedCustomerName},</p>
                            <p>Thank you for your order! Your order ID is: ${orderId}</p>
                            <p>Items Total: $${itemsTotal.toFixed(2)}</p>
                            <p>Shipping: $${shippingCost.toFixed(2)}</p>
                            <p><strong>Total: $${total.toFixed(2)}</strong></p>
                            <p>You can find us at the Royal Oak Farmers Market every Saturday from 7AM - 1PM.</p>
                            <p>Thank you for supporting Nomad Detroit Coffee!</p>
                        `
                    });
                } catch (emailError) {
                    console.log('Email sending failed:', emailError.message);
                    // Don't fail the order if email fails
                }
            }
            
            res.status(200).json({ 
                success: true, 
                orderId,
                total,
                message: 'Payment processed and order completed successfully' 
            });
        
        } catch (dbError) {
            await client.query('ROLLBACK');
            console.error('Database error:', dbError);
            res.status(500).json({ 
                error: 'Database error: ' + dbError.message 
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({ 
            error: 'Server error: ' + error.message 
        });
    }
}