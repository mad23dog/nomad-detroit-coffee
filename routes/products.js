const express = require('express');
const router = express.Router();
const { db } = require('../database/init');
const { requireAdmin } = require('../middleware/auth');
const { validateStockUpdate } = require('../middleware/validation');

// Get all products
router.get('/', (req, res) => {
    db.all("SELECT * FROM products WHERE stock_quantity > 0", (err, rows) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Failed to fetch products' });
        }
        res.json(rows);
    });
});

// Get single product
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
        if (err) {
            console.error('Error fetching product:', err);
            return res.status(500).json({ error: 'Failed to fetch product' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(row);
    });
});

// Update product stock (admin only)
router.put('/:id/stock', requireAdmin, validateStockUpdate, (req, res) => {
    const { id } = req.params;
    const { stock_quantity } = req.body;
    
    if (stock_quantity < 0) {
        return res.status(400).json({ error: 'Stock quantity cannot be negative' });
    }
    
    db.run(
        "UPDATE products SET stock_quantity = ? WHERE id = ?",
        [stock_quantity, id],
        function(err) {
            if (err) {
                console.error('Error updating stock:', err);
                return res.status(500).json({ error: 'Failed to update stock' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            
            res.json({ message: 'Stock updated successfully' });
        }
    );
});

module.exports = router;