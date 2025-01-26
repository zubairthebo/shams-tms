import express from 'express';
import { authenticateToken } from '../auth.js';
import dbPool from '../db/index.js';
import { generateCategoryXML } from '../utils/xmlGenerator.js';

const router = express.Router();

// Get news items
router.get('/news', authenticateToken, async (req, res) => {
    try {
        const [rows] = await dbPool.query(`
            SELECT 
                n.id,
                n.text,
                n.created_at as timestamp,
                n.category_id as category
            FROM news_items n 
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
        
        const [uuidResult] = await dbPool.query('SELECT UUID() as uuid');
        const newsId = uuidResult[0].uuid;

        await dbPool.query(
            'INSERT INTO news_items (id, text, category_id, created_by) VALUES (?, ?, ?, ?)',
            [newsId, text, category, req.user.id]
        );

        // Generate new XML for this category
        await generateCategoryXML(category);

        const [insertedItem] = await dbPool.query(`
            SELECT 
                id,
                text,
                created_at as timestamp,
                category_id as category
            FROM news_items 
            WHERE id = ?
        `, [newsId]);

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

        const [newsItem] = await dbPool.query(
            'SELECT * FROM news_items WHERE id = ?',
            [id]
        );

        if (newsItem.length === 0) {
            return res.status(404).json({ error: 'News item not found' });
        }

        await dbPool.query(
            'UPDATE news_items SET text = ? WHERE id = ?',
            [text, id]
        );

        // Generate new XML for this category
        await generateCategoryXML(newsItem[0].category_id);

        const [updatedItem] = await dbPool.query(`
            SELECT 
                id,
                text,
                created_at as timestamp,
                category_id as category
            FROM news_items 
            WHERE id = ?
        `, [id]);

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

        const [newsItem] = await dbPool.query(
            'SELECT * FROM news_items WHERE id = ?',
            [id]
        );

        if (newsItem.length === 0) {
            return res.status(404).json({ error: 'News item not found' });
        }

        const categoryId = newsItem[0].category_id;

        await dbPool.query('DELETE FROM news_items WHERE id = ?', [id]);

        // Generate new XML for this category
        await generateCategoryXML(categoryId);

        res.json({ message: 'News item deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news item' });
    }
});

export default router;