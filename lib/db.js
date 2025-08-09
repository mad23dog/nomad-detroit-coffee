const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
const initializeDatabase = async () => {
    const client = await pool.connect();
    
    try {
        // Create products table
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                description TEXT,
                image_path VARCHAR(500),
                stock_quantity INTEGER DEFAULT 100,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create orders table
        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                order_id VARCHAR(255) UNIQUE NOT NULL,
                paypal_order_id VARCHAR(255),
                customer_email VARCHAR(255) NOT NULL,
                customer_name VARCHAR(255) NOT NULL,
                shipping_address TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                total_amount DECIMAL(10,2) NOT NULL,
                shipping_amount DECIMAL(10,2) DEFAULT 5.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            )
        `);

        // Ensure shipping_amount column exists (for existing databases)
        try {
            const columnCheck = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'orders' AND column_name = 'shipping_amount'
            `);
            
            if (columnCheck.rows.length === 0) {
                console.log('Adding shipping_amount column to existing orders table...');
                await client.query(`
                    ALTER TABLE orders 
                    ADD COLUMN shipping_amount DECIMAL(10,2) DEFAULT 5.00
                `);
                console.log('shipping_amount column added successfully');
            }
        } catch (alterError) {
            console.log('Column shipping_amount may already exist or table structure is correct');
        }

        // Create order_items table
        await client.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id VARCHAR(255) NOT NULL,
                product_id INTEGER NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                quantity INTEGER NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(order_id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        // Check if products exist, if not, insert them
        const { rows } = await client.query('SELECT COUNT(*) as count FROM products');
        
        if (parseInt(rows[0].count) === 0) {
            const products = [
                {
                    name: 'Ethiopia',
                    price: 22.00,
                    description: 'Single-origin Ethiopian coffee with vibrant blueberry sweetness and bright lemon citrus notes, reminiscent of a fresh-baked pound cake. Natural processed beans from the Wush Wush region.',
                    image_path: 'Images/Bag Info Labels/Ethiopia.png'
                },
                {
                    name: 'Guatemala',
                    price: 22.00,
                    description: 'Rich Guatemalan single-origin from Baja Verapaz with indulgent macadamia nut richness and sweet cookie-like finish. Washed process brings out clean, balanced flavors.',
                    image_path: 'Images/Bag Info Labels/Guatemala.png'
                },
                {
                    name: 'Nicaragua',
                    price: 22.00,
                    description: 'Nicaraguan single-origin from Matagalpa featuring warm brown sugar sweetness, bright cherry acidity, and satisfying nutty undertones. Expertly washed for clarity and balance.',
                    image_path: 'Images/Bag Info Labels/Nicaragua.png'
                },
                {
                    name: 'Vagabond',
                    price: 22.00,
                    description: 'Premium blend combining Ethiopian and Nicaraguan beans. Complex flavor profile with juicy blueberry notes, zesty citrus brightness, and smooth almond finish. Washed and natural processing.',
                    image_path: 'Images/Bag Info Labels/Vagabond.png'
                },
                {
                    name: 'Decaf',
                    price: 22.00,
                    description: 'Colombian decaf from Valle de Cauca with warming clove spice, sweet cherry notes, and rich honeycomb sweetness. All the exceptional flavor without the caffeine.',
                    image_path: 'Images/Bag Info Labels/Decaf.png'
                }
            ];

            for (const product of products) {
                await client.query(
                    'INSERT INTO products (name, price, description, image_path) VALUES ($1, $2, $3, $4)',
                    [product.name, product.price, product.description, product.image_path]
                );
            }
            console.log('Products initialized');
        }
        
    } catch (error) {
        console.error('Database initialization error:', error);
    } finally {
        client.release();
    }
};

module.exports = { pool, initializeDatabase };