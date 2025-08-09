const { pool } = require('../lib/db');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const client = await pool.connect();
    
    try {
        console.log('Starting database migration...');
        
        // Check if shipping_amount column exists
        const columnCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'shipping_amount'
        `);
        
        if (columnCheck.rows.length === 0) {
            console.log('Adding shipping_amount column to orders table...');
            
            // Add the missing shipping_amount column
            await client.query(`
                ALTER TABLE orders 
                ADD COLUMN shipping_amount DECIMAL(10,2) DEFAULT 5.00
            `);
            
            console.log('shipping_amount column added successfully');
            
            // Update existing orders to have shipping amount
            const updateResult = await client.query(`
                UPDATE orders 
                SET shipping_amount = 5.00 
                WHERE shipping_amount IS NULL
            `);
            
            console.log(`Updated ${updateResult.rowCount} existing orders with shipping amount`);
            
            res.status(200).json({ 
                success: true, 
                message: 'Database migration completed successfully',
                details: {
                    columnAdded: true,
                    ordersUpdated: updateResult.rowCount
                }
            });
        } else {
            console.log('shipping_amount column already exists');
            res.status(200).json({ 
                success: true, 
                message: 'Database migration not needed - shipping_amount column already exists' 
            });
        }
        
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Migration failed', 
            details: error.message 
        });
    } finally {
        client.release();
    }
};