import express from 'express';
import { authenticateToken } from '../auth.js';
import dbPool from '../db/index.js';
import { saveXML } from '../xmlGenerator.js';

const router = express.Router();

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

router.post('/news', authenticateToken, async (req, res) => {
    try {
        const { text, category } = req.body;
        
        // Verify category exists first
        const [categoryExists] = await dbPool.query(
            'SELECT id FROM categories WHERE id = ?',
            [category]
        );

        if (categoryExists.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        const [uuidResult] = await dbPool.query('SELECT UUID() as uuid');
        const newsId = uuidResult[0].uuid;

        await dbPool.query(
            'INSERT INTO news_items (id, text, category_id, created_by) VALUES (?, ?, ?, ?)',
            [newsId, text, category, req.user.id]
        );

        // Generate new XML for this category
        await saveXML({ body: { categoryId: category }, user: req.user }, res);

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

router.put('/news/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        // First check if the news item exists
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
        await saveXML({ body: { categoryId: newsItem[0].category_id }, user: req.user }, res);

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

router.delete('/news/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // First check if the news item exists
        const [newsItem] = await dbPool.query(
            'SELECT * FROM news_items WHERE id = ?',
            [id]
        );

        if (newsItem.length === 0) {
            return res.status(404).json({ error: 'News item not found' });
        }

        const categoryId = newsItem[0].category_id;

        // Verify the category exists
        const [categoryExists] = await dbPool.query(
            'SELECT id FROM categories WHERE id = ?',
            [categoryId]
        );

        if (categoryExists.length === 0) {
            // If category doesn't exist, we should still delete the news item
            await dbPool.query('DELETE FROM news_items WHERE id = ?', [id]);
            return res.json({ message: 'News item deleted successfully' });
        }

        // Delete the news item
        await dbPool.query('DELETE FROM news_items WHERE id = ?', [id]);

        // Generate new XML for this category
        await saveXML({ body: { categoryId }, user: req.user }, res);

        res.json({ message: 'News item deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news item' });
    }
});

export default router;
