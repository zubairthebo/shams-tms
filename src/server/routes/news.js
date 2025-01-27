import express from 'express';
import { authenticateToken } from '../auth.js';
import dbPool from '../db/index.js';
import { generateCategoryXML } from '../utils/xmlGenerator.js';

const router = express.Router();

// Get news items
router.get('/news', authenticateToken, async (req, res) => {
    try {
        const [rows] = await dbPool.execute(`
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
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const { text, category } = req.body;
        
        // First verify the category exists
        const [categories] = await connection.execute(
            'SELECT id FROM categories WHERE identifier = ?',
            [category]
        );

        if (categories.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Invalid category' });
        }

        const categoryId = categories[0].id;

        // Generate UUID v4
        const [uuidResult] = await connection.execute('SELECT UUID() as uuid');
        const newsId = uuidResult[0].uuid;

        // Insert the news item
        await connection.execute(
            'INSERT INTO news_items (id, text, category_id, created_by) VALUES (?, ?, ?, ?)',
            [newsId, text, categoryId, req.user.id]
        );

        await connection.commit();

        // Generate new XML for this category
        await generateCategoryXML(category);

        const [insertedItem] = await connection.execute(`
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
        await connection.rollback();
        console.error('Error creating news:', error);
        res.status(500).json({ error: 'Failed to create news item' });
    } finally {
        connection.release();
    }
});

// Update news item
router.put('/news/:id', authenticateToken, async (req, res) => {
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { text } = req.body;

        // Check if news item exists and get its category
        const [newsItems] = await connection.execute(
            'SELECT * FROM news_items WHERE id = ?',
            [id]
        );

        if (newsItems.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'News item not found' });
        }

        const newsItem = newsItems[0];

        // Get category identifier
        const [categories] = await connection.execute(
            'SELECT identifier FROM categories WHERE id = ?',
            [newsItem.category_id]
        );

        // Update the news item
        await connection.execute(
            'UPDATE news_items SET text = ? WHERE id = ?',
            [text, id]
        );

        await connection.commit();

        // Generate new XML for this category
        if (categories.length > 0) {
            await generateCategoryXML(categories[0].identifier);
        }

        const [updatedItem] = await connection.execute(`
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
        await connection.rollback();
        console.error('Error updating news:', error);
        res.status(500).json({ error: 'Failed to update news item' });
    } finally {
        connection.release();
    }
});

// Delete news item
router.delete('/news/:id', authenticateToken, async (req, res) => {
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;

        // Check if news item exists and get its category
        const [newsItems] = await connection.execute(
            'SELECT * FROM news_items WHERE id = ?',
            [id]
        );

        if (newsItems.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'News item not found' });
        }

        const newsItem = newsItems[0];

        // Get category identifier
        const [categories] = await connection.execute(
            'SELECT identifier FROM categories WHERE id = ?',
            [newsItem.category_id]
        );

        // Delete the news item
        await connection.execute(
            'DELETE FROM news_items WHERE id = ?', 
            [id]
        );

        await connection.commit();

        // Generate new XML for this category
        if (categories.length > 0) {
            await generateCategoryXML(categories[0].identifier);
        }

        res.json({ message: 'News item deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news item' });
    } finally {
        connection.release();
    }
});

export default router;