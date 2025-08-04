const { pool } = require('../../lib/db');
const { sendOrderConfirmation } = require('../../lib/email');
const axios = require('axios');

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

export default async function handler(req, res) {
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

        await client.query('BEGIN');
        
        // Update order status
        await client.query(
            'UPDATE orders SET status = $1, paypal_order_id = $2, completed_at = CURRENT_TIMESTAMP WHERE order_id = $3',
            ['completed', paypalOrderId, orderId]
        );
        
        // Update inventory
        await client.query(`
            UPDATE products 
            SET stock_quantity = stock_quantity - order_items.quantity
            FROM order_items 
            WHERE products.id = order_items.product_id 
            AND order_items.order_id = $1
        `, [orderId]);

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
            message: 'Payment verified and order completed' 
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    } finally {
        client.release();
    }
}