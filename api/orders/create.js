const { pool } = require('../../lib/db');
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
        const { items, customerEmail, customerName, paypalOrderId } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items in order' });
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
        
        // Create order in database
        await client.query(
            'INSERT INTO orders (order_id, customer_email, customer_name, total_amount, status, paypal_order_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [orderId, customerEmail, customerName, total, 'pending', paypalOrderId]
        );
        
        // Insert order items
        for (const item of orderItems) {
            await client.query(
                'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES ($1, $2, $3, $4, $5)',
                [orderId, item.product_id, item.product_name, item.quantity, item.price]
            );
        }

        await client.query('COMMIT');
        
        res.status(200).json({ 
            orderId, 
            total,
            message: 'Order created successfully' 
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    } finally {
        client.release();
    }
}