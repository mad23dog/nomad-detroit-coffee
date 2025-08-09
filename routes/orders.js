const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');
const { sendOrderConfirmation } = require('../utils/email');

// PayPal API base URL
const PAYPAL_API = process.env.PAYPAL_MODE === 'production' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
async function getPayPalAccessToken() {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    try {
        const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, 
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting PayPal access token:', error);
        throw error;
    }
}

// Create order
router.post('/create', async (req, res) => {
    try {
        const { items, customerEmail, customerName } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items in order' });
        }

        // Generate unique order ID
        const orderId = uuidv4();
        
        // Calculate total
        let total = 0;
        const orderItems = [];
        
        for (const item of items) {
            // Verify product exists and has stock
            const product = await new Promise((resolve, reject) => {
                db.get(
                    "SELECT * FROM products WHERE name = ? AND stock_quantity >= ?",
                    [item.name, item.quantity],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });
            
            if (!product) {
                return res.status(400).json({ 
                    error: `Product ${item.name} not available in requested quantity` 
                });
            }
            
            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            
            orderItems.push({
                product_id: product.id,
                product_name: product.name,
                quantity: item.quantity,
                price: product.price
            });
        }
        
        // Create order in database
        db.run(
            `INSERT INTO orders (order_id, customer_email, customer_name, total_amount, status) 
             VALUES (?, ?, ?, ?, ?)`,
            [orderId, customerEmail, customerName, total, 'pending'],
            function(err) {
                if (err) {
                    console.error('Error creating order:', err);
                    return res.status(500).json({ error: 'Failed to create order' });
                }
                
                // Insert order items
                const stmt = db.prepare(
                    `INSERT INTO order_items (order_id, product_id, product_name, quantity, price) 
                     VALUES (?, ?, ?, ?, ?)`
                );
                
                orderItems.forEach(item => {
                    stmt.run(orderId, item.product_id, item.product_name, item.quantity, item.price);
                });
                
                stmt.finalize();
                
                res.json({ 
                    orderId, 
                    total,
                    message: 'Order created successfully' 
                });
            }
        );
        
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Verify PayPal payment
router.post('/verify-payment', async (req, res) => {
    try {
        const { orderId, paypalOrderId } = req.body;
        
        // Get access token
        const accessToken = await getPayPalAccessToken();
        
        // Verify the payment with PayPal
        const response = await axios.get(
            `${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const paypalOrder = response.data;
        
        // Verify payment is completed
        if (paypalOrder.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'Payment not completed' });
        }
        
        // Update order status
        db.run(
            `UPDATE orders 
             SET status = 'completed', paypal_order_id = ?, completed_at = CURRENT_TIMESTAMP 
             WHERE order_id = ?`,
            [paypalOrderId, orderId],
            async function(err) {
                if (err) {
                    console.error('Error updating order:', err);
                    return res.status(500).json({ error: 'Failed to update order' });
                }
                
                // Update inventory
                db.run(`
                    UPDATE products 
                    SET stock_quantity = stock_quantity - (
                        SELECT quantity FROM order_items 
                        WHERE order_id = ? AND product_id = products.id
                    )
                    WHERE id IN (
                        SELECT product_id FROM order_items WHERE order_id = ?
                    )
                `, [orderId, orderId]);
                
                // Get order details for email
                db.get(
                    "SELECT * FROM orders WHERE order_id = ?",
                    [orderId],
                    (err, order) => {
                        if (!err && order) {
                            // Send confirmation email
                            sendOrderConfirmation(order);
                        }
                    }
                );
                
                res.json({ 
                    success: true, 
                    message: 'Payment verified and order completed' 
                });
            }
        );
        
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

// Get order status
router.get('/:orderId', (req, res) => {
    const { orderId } = req.params;
    
    db.get(
        `SELECT o.*, GROUP_CONCAT(
            json_object(
                'product_name', oi.product_name,
                'quantity', oi.quantity,
                'price', oi.price
            )
        ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        WHERE o.order_id = ?
        GROUP BY o.order_id`,
        [orderId],
        (err, row) => {
            if (err) {
                console.error('Error fetching order:', err);
                return res.status(500).json({ error: 'Failed to fetch order' });
            }
            
            if (!row) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            res.json(row);
        }
    );
});

module.exports = router;