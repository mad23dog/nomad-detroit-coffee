const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// Database connection
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Email transporter
const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOrderConfirmation = async (order) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: order.customer_email,
            subject: `Order Confirmation - Nomad Detroit Coffee #${order.order_id}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #1abc9c, #8e44ad); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Nomad Detroit Coffee</h1>
                        <p style="color: white; margin: 5px 0 0 0;">Thank you for your order!</p>
                    </div>
                    
                    <div style="padding: 20px; background: #f9f9f9;">
                        <h2>Order Confirmation</h2>
                        <p>Hi ${order.customer_name},</p>
                        <p>Thank you for your order! We've received your payment and your order is being processed.</p>
                        
                        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3>Order Details</h3>
                            <p><strong>Order ID:</strong> ${order.order_id}</p>
                            <p><strong>Total:</strong> $${order.total_amount}</p>
                            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        
                        <p>You can find us at the Royal Oak Farmers Market every Saturday from 7AM - 1PM at:</p>
                        <p>316 E 11 Mile Rd, Royal Oak, MI 48067</p>
                        
                        <p>If you have any questions, feel free to reach out to us at <a href="mailto:hello@nomaddetroitcoffee.com">hello@nomaddetroitcoffee.com</a></p>
                        
                        <p>Thank you for supporting Nomad Detroit Coffee!</p>
                    </div>
                    
                    <div style="background: #333; color: white; padding: 15px; text-align: center;">
                        <p>&copy; 2025 Nomad Detroit Coffee. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation sent to ${order.customer_email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
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
    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({ error: 'Server error: ' + error.message });
    }
}