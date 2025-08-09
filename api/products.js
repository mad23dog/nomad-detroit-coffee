const { pool } = require('../lib/db');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Get all products
            const { rows } = await pool.query('SELECT * FROM products WHERE stock_quantity > 0');
            return res.status(200).json(rows);
        }

        if (req.method === 'PUT') {
            // Update product stock (admin only)
            const { id } = req.query;
            const { stock_quantity } = req.body;

            if (stock_quantity < 0) {
                return res.status(400).json({ error: 'Stock quantity cannot be negative' });
            }

            const { rowCount } = await pool.query(
                'UPDATE products SET stock_quantity = $1 WHERE id = $2',
                [stock_quantity, id]
            );

            if (rowCount === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }

            return res.status(200).json({ message: 'Stock updated successfully' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Products API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}