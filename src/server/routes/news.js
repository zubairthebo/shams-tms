import express from 'express';
import { authenticateToken } from '../auth.js';
import dbPool from '../db/index.js';
import { generateTickerXML } from '../xmlGenerator.js';

const router = express.Router();

// Create news item
router.post('/news', authenticateToken, async (req, res) => {
    try {
        const { text, category } = req.body;
        const [userResult] = await dbPool.query('SELECT id FROM users WHERE username = ?', [req.user.username]);
        const userId = userResult[0].id;

        // Check if user has access to this category
        if (req.user.role !== 'admin') {
            const [categoryAccess] = await dbPool.query(
                'SELECT 1 FROM user_categories uc JOIN categories c ON uc.category_id = c.id WHERE uc.user_id = ? AND c.identifier = ?',
                [userId, category]
            );
            if (categoryAccess.length === 0) {
                return res.status(403).json({ error: 'No access to this category' });
            }
        }

        // Insert news item
        const [result] = await dbPool.query(
            'INSERT INTO news_items (id, text, category_id, created_by) VALUES (UUID(), ?, ?, ?)',
            [text, category, userId]
        );

        // Generate XML for this category
        await generateTickerXML(category);

        res.json({ id: result.insertId, message: 'News item created successfully' });
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ error: 'Failed to create news item' });
    }
});

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

// Update news item
router.put('/news/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const [userResult] = await dbPool.query('SELECT id FROM users WHERE username = ?', [req.user.username]);
        const userId = userResult[0].id;

        // Check if user has access to this news item
        const [newsItem] = await dbPool.query(
            'SELECT category_id FROM news_items WHERE id = ?',
            [id]
        );

        if (req.user.role !== 'admin') {
            const [categoryAccess] = await dbPool.query(
                'SELECT 1 FROM user_categories WHERE user_id = ? AND category_id = ?',
                [userId, newsItem[0].category_id]
            );
            if (categoryAccess.length === 0) {
                return res.status(403).json({ error: 'No access to this news item' });
            }
        }

        await dbPool.query(
            'UPDATE news_items SET text = ? WHERE id = ?',
            [text, id]
        );

        // Generate XML for this category
        await generateTickerXML(newsItem[0].category_id);

        res.json({ message: 'News item updated successfully' });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ error: 'Failed to update news item' });
    }
});

// Delete news item
router.delete('/news/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const [userResult] = await dbPool.query('SELECT id FROM users WHERE username = ?', [req.user.username]);
        const userId = userResult[0].id;

        // Check if user has access to this news item
        const [newsItem] = await dbPool.query(
            'SELECT category_id FROM news_items WHERE id = ?',
            [id]
        );

        if (req.user.role !== 'admin') {
            const [categoryAccess] = await dbPool.query(
                'SELECT 1 FROM user_categories WHERE user_id = ? AND category_id = ?',
                [userId, newsItem[0].category_id]
            );
            if (categoryAccess.length === 0) {
                return res.status(403).json({ error: 'No access to this news item' });
            }
        }

        await dbPool.query('DELETE FROM news_items WHERE id = ?', [id]);

        // Generate XML for this category
        await generateTickerXML(newsItem[0].category_id);

        res.json({ message: 'News item deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news item' });
    }
});

export default router;