import express from 'express';
import { authenticateToken } from '../auth.js';
import dbPool from '../db/index.js';

const router = express.Router();

// Get news items
router.get('/news', authenticateToken, async (req, res) => {
    try {
        const [rows] = await dbPool.query(`
            SELECT n.*, c.identifier as category 
            FROM news_items n 
            JOIN categories c ON n.category_id = c.identifier 
            ORDER BY n.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news items' });
    }
});

// Create news item
router.post('/news', authenticateToken, async (req, res) => {
    try {
        const { text, category } = req.body;
        
        // Verify category exists
        const [categoryCheck] = await dbPool.query(
            'SELECT identifier FROM categories WHERE identifier = ?',
            [category]
        );
        
        if (categoryCheck.length === 0) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        // Generate UUID for the news item
        const [uuidResult] = await dbPool.query('SELECT UUID() as uuid');
        const newsId = uuidResult[0].uuid;

        // Insert news item with the category identifier directly
        await dbPool.query(
            'INSERT INTO news_items (id, text, category_id, created_by) VALUES (?, ?, ?, ?)',
            [newsId, text, category, req.user.id]
        );

        const [insertedItem] = await dbPool.query(
            `SELECT n.*, c.identifier as category 
             FROM news_items n 
             JOIN categories c ON n.category_id = c.identifier 
             WHERE n.id = ?`,
            [newsId]
        );

        if (insertedItem.length === 0) {
            return res.status(500).json({ error: 'Failed to create news item' });
        }

        res.status(201).json(insertedItem[0]);
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ error: 'Failed to create news item' });
    }
});

// Update news item
router.put('/news/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        // Check if news item exists
        const [newsItem] = await dbPool.query(
            `SELECT n.*, c.identifier as category 
             FROM news_items n 
             JOIN categories c ON n.category_id = c.identifier 
             WHERE n.id = ?`,
            [id]
        );

        if (newsItem.length === 0) {
            return res.status(404).json({ error: 'News item not found' });
        }

        // Check user permissions
        if (req.user.role !== 'admin') {
            const [hasAccess] = await dbPool.query(
                `SELECT 1 FROM user_categories uc 
                 JOIN categories c ON uc.category_id = c.id 
                 WHERE uc.user_id = ? AND c.identifier = ?`,
                [req.user.id, newsItem[0].category]
            );
            if (hasAccess.length === 0) {
                return res.status(403).json({ error: 'No access to this news item' });
            }
        }

        // Update the news item
        await dbPool.query(
            'UPDATE news_items SET text = ? WHERE id = ?',
            [text, id]
        );

        // Get updated item
        const [updatedItem] = await dbPool.query(
            `SELECT n.*, c.identifier as category 
             FROM news_items n 
             JOIN categories c ON n.category_id = c.identifier 
             WHERE n.id = ?`,
            [id]
        );

        res.json(updatedItem[0]);
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ error: 'Failed to update news item' });
    }
});

// Delete news item
router.delete('/news/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if news item exists
        const [newsItem] = await dbPool.query(
            `SELECT n.*, c.identifier as category 
             FROM news_items n 
             JOIN categories c ON n.category_id = c.identifier 
             WHERE n.id = ?`,
            [id]
        );

        if (newsItem.length === 0) {
            return res.status(404).json({ error: 'News item not found' });
        }

        // Check user permissions
        if (req.user.role !== 'admin') {
            const [hasAccess] = await dbPool.query(
                `SELECT 1 FROM user_categories uc 
                 JOIN categories c ON uc.category_id = c.id 
                 WHERE uc.user_id = ? AND c.identifier = ?`,
                [req.user.id, newsItem[0].category]
            );
            if (hasAccess.length === 0) {
                return res.status(403).json({ error: 'No access to this news item' });
            }
        }

        // Delete the news item
        await dbPool.query('DELETE FROM news_items WHERE id = ?', [id]);
        res.json({ message: 'News item deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news item' });
    }
});

export default router;