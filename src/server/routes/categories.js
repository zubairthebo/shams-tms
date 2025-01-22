import express from 'express';
import { authenticateToken } from '../auth.js';
import { CATEGORIES_FILE } from '../config.js';
import fs from 'fs';

const router = express.Router();

router.get('/categories', (req, res) => {
    try {
        if (!fs.existsSync(CATEGORIES_FILE)) {
            return res.status(404).json({ error: 'Categories file not found' });
        }
        const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE));
        res.json(categories);
    } catch (error) {
        console.error('Error reading categories:', error);
        res.status(500).json({ error: 'Failed to read categories' });
    }
});

router.put('/categories/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const { id } = req.params;
        const { ar, en } = req.body;
        
        const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE));
        categories[id] = { ar, en };
        
        fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

export default router;