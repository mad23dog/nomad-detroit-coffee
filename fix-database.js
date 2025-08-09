// Temporary script to fix database shipping_amount column
// Run this locally or on your server to add the missing column

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 Starting database fix...');
        
        // Check if shipping_amount column exists
        console.log('📋 Checking for shipping_amount column...');
        const columnCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'shipping_amount'
        `);
        
        if (columnCheck.rows.length === 0) {
            console.log('➕ Adding shipping_amount column to orders table...');
            
            // Add the missing shipping_amount column
            await client.query(`
                ALTER TABLE orders 
                ADD COLUMN shipping_amount DECIMAL(10,2) DEFAULT 5.00
            `);
            
            console.log('✅ shipping_amount column added successfully');
            
            // Update existing orders to have shipping amount
            const updateResult = await client.query(`
                UPDATE orders 
                SET shipping_amount = 5.00 
                WHERE shipping_amount IS NULL
            `);
            
            console.log(`✅ Updated ${updateResult.rowCount} existing orders with shipping amount`);
            
        } else {
            console.log('✅ shipping_amount column already exists - no action needed');
        }
        
        console.log('🎉 Database fix completed successfully!');
        
    } catch (error) {
        console.error('❌ Database fix failed:', error.message);
    } finally {
        client.release();
        process.exit();
    }
}

// Run the fix
fixDatabase().catch(console.error);