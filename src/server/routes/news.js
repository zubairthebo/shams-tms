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
                c.identifier as category
            FROM news_items n 
            JOIN categories c ON n.category_id = c.id
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
        
        if (!text || !category) {
            return res.status(400).json({ error: 'Text and category are required' });
        }

        // Get category ID from identifier
        const [categoryResult] = await dbPool.query(
            'SELECT id FROM categories WHERE identifier = ?',
            [category]
        );

        if (categoryResult.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const categoryId = categoryResult[0].id;
        
        const [uuidResult] = await dbPool.query('SELECT UUID() as uuid');
        const newsId = uuidResult[0].uuid;

        // Insert news item
        await dbPool.query(
            'INSERT INTO news_items (id, text, category_id, created_by) VALUES (?, ?, ?, ?)',
            [newsId, text, categoryId, req.user.id]
        );

        // Generate XML after inserting the news item
        try {
            await saveXML({ body: { categoryId: category }, user: req.user });
        } catch (xmlError) {
            console.error('XML generation error:', xmlError);
            // Continue with the response even if XML generation fails
        }

        const [insertedItem] = await dbPool.query(`
            SELECT 
                n.id,
                n.text,
                n.created_at as timestamp,
                c.identifier as category
            FROM news_items n 
            JOIN categories c ON n.category_id = c.id
            WHERE n.id = ?
        `, [newsId]);

        res.status(201).json(insertedItem[0]);
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ error: 'Failed to create news item', details: error.message });
    }
});

router.put('/news/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        const [newsItem] = await dbPool.query(
            'SELECT n.*, c.identifier as category FROM news_items n JOIN categories c ON n.category_id = c.id WHERE n.id = ?',
            [id]
        );

        if (newsItem.length === 0) {
            return res.status(404).json({ error: 'News item not found' });
        }

        await dbPool.query(
            'UPDATE news_items SET text = ? WHERE id = ?',
            [text, id]
        );

        // Generate XML after updating the news item
        try {
            await saveXML({ body: { categoryId: newsItem[0].category }, user: req.user });
        } catch (xmlError) {
            console.error('XML generation error:', xmlError);
            // Continue with the response even if XML generation fails
        }

        const [updatedItem] = await dbPool.query(`
            SELECT 
                n.id,
                n.text,
                n.created_at as timestamp,
                c.identifier as category
            FROM news_items n 
            JOIN categories c ON n.category_id = c.id
            WHERE n.id = ?
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

        const [newsItem] = await dbPool.query(
            'SELECT n.*, c.identifier as category FROM news_items n JOIN categories c ON n.category_id = c.id WHERE n.id = ?',
            [id]
        );

        if (newsItem.length === 0) {
            return res.status(404).json({ error: 'News item not found' });
        }

        const category = newsItem[0].category;

        await dbPool.query('DELETE FROM news_items WHERE id = ?', [id]);

        // Generate XML after deleting the news item
        try {
            await saveXML({ body: { categoryId: category }, user: req.user });
        } catch (xmlError) {
            console.error('XML generation error:', xmlError);
            // Continue with the response even if XML generation fails
        }

        res.json({ message: 'News item deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news item' });
    }
});

export default router;