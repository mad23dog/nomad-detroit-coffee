const { initializeDatabase } = require('../lib/db');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await initializeDatabase();
        res.status(200).json({ message: 'Database initialized successfully' });
    } catch (error) {
        console.error('Database initialization error:', error);
        res.status(500).json({ error: 'Failed to initialize database' });
    }
}