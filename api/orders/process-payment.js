const { pool } = require('../../lib/db');
const { sendOrderConfirmation } = require('../../lib/email');
const { v4: uuidv4 } = require('uuid');

module.exports = async function handler(req, res) {
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

    const client = await pool.connect();

    try {
        const { items, customerEmail, customerName, paypalOrderId, paypalDetails } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items in order' });
        }

        if (!customerName || !customerEmail) {
            return res.status(400).json({ error: 'Customer information missing' });
        }

        // Generate unique order ID
        const orderId = uuidv4();
        
        // Calculate total
        let total = 0;
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
            total += itemTotal;
            
            orderItems.push({
                product_id: product.id,
                product_name: product.name,
                quantity: item.quantity,
                price: product.price
            });
        }
        
        // Create completed order in database
        await client.query(
            'INSERT INTO orders (order_id, customer_email, customer_name, total_amount, status, paypal_order_id, completed_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)',
            [orderId, customerEmail, customerName, total, 'completed', paypalOrderId]
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
        
        // Get order details for email
        const orderResult = await client.query(
            'SELECT * FROM orders WHERE order_id = $1',
            [orderId]
        );
        
        if (orderResult.rows.length > 0) {
            // Send confirmation email
            await sendOrderConfirmation(orderResult.rows[0]);
        }
        
        res.status(200).json({ 
            success: true, 
            orderId,
            message: 'Payment processed and order completed' 
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Failed to process payment: ' + error.message });
    } finally {
        client.release();
    }
}