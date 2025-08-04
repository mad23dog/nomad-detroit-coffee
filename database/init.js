const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_FILE || path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

const initialize = () => {
    db.serialize(() => {
        // Products table
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                description TEXT,
                image_path TEXT,
                stock_quantity INTEGER DEFAULT 100,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Orders table
        db.run(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT UNIQUE NOT NULL,
                paypal_order_id TEXT,
                customer_email TEXT NOT NULL,
                customer_name TEXT NOT NULL,
                shipping_address TEXT,
                status TEXT DEFAULT 'pending',
                total_amount DECIMAL(10,2) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME
            )
        `);

        // Order items table
        db.run(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                product_id INTEGER NOT NULL,
                product_name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(order_id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        // Initialize products if empty
        db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
            if (row.count === 0) {
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

                const stmt = db.prepare("INSERT INTO products (name, price, description, image_path) VALUES (?, ?, ?, ?)");
                products.forEach(product => {
                    stmt.run(product.name, product.price, product.description, product.image_path);
                });
                stmt.finalize();
                console.log('Products initialized');
            }
        });
    });
};

module.exports = { db, initialize };