import express from 'express';
import { authenticateToken } from '../auth.js';
import { XML_DIR } from '../config.js';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const router = express.Router();

// Database connection
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'news_ticker'
});

const generateTickerXML = (items, category) => {
    const categoryUpper = category.toUpperCase();
    return `<?xml version="1.0" encoding="UTF-8"?>
<tickerfeed version="2.4">
    <playlist type="flipping_carousel" name="MAIN_TICKER" target="carousel">
        <defaults>
            <template>TICKER_${categoryUpper}_START</template>
        </defaults>
        <element />
    </playlist>
    <playlist type="flipping_carousel" name="MAIN_TICKER" target="carousel">
        <defaults>
            <template>TICKER_${categoryUpper}</template>
            <attributes>
                <attribute name="custom_attribute">custom value</attribute>
            </attributes>
        </defaults>${items.map(item => `
        <element>
            <field name="1">${item.text.replace(/[<>&'"]/g, char => ({
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                "'": '&apos;',
                '"': '&quot;'
            }[char]))}</field>
        </element>`).join('')}
    </playlist>
</tickerfeed>`;
};

// Create news item
router.post('/news', authenticateToken, async (req, res) => {
    try {
        const { text, category } = req.body;
        const id = crypto.randomUUID();
        
        const connection = await pool.getConnection();
        await connection.execute(
            'INSERT INTO news_items (id, text, category, created_by) VALUES (?, ?, ?, ?)',
            [id, text, category, req.user.username]
        );
        connection.release();

        // Get all items for this category and generate XML
        const [items] = await pool.execute(
            'SELECT * FROM news_items WHERE category = ? ORDER BY timestamp',
            [category]
        );
        
        const xmlContent = generateTickerXML(items, category);
        const filepath = path.join(XML_DIR, `${category}.xml`);
        fs.writeFileSync(filepath, xmlContent);

        res.json({ id, message: 'News item created successfully' });
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ error: 'Failed to create news item' });
    }
});

// Get news items
router.get('/news', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM news_items ORDER BY timestamp DESC'
        );
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

        const connection = await pool.getConnection();
        await connection.execute(
            'UPDATE news_items SET text = ? WHERE id = ?',
            [text, id]
        );
        connection.release();

        // Get category for this item
        const [rows] = await pool.execute(
            'SELECT category FROM news_items WHERE id = ?',
            [id]
        );
        const category = rows[0].category;

        // Regenerate XML for this category
        const [items] = await pool.execute(
            'SELECT * FROM news_items WHERE category = ? ORDER BY timestamp',
            [category]
        );
        
        const xmlContent = generateTickerXML(items, category);
        const filepath = path.join(XML_DIR, `${category}.xml`);
        fs.writeFileSync(filepath, xmlContent);

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

        // Get category before deleting
        const [rows] = await pool.execute(
            'SELECT category FROM news_items WHERE id = ?',
            [id]
        );
        const category = rows[0].category;

        // Delete the item
        const connection = await pool.getConnection();
        await connection.execute(
            'DELETE FROM news_items WHERE id = ?',
            [id]
        );
        connection.release();

        // Regenerate XML for this category
        const [items] = await pool.execute(
            'SELECT * FROM news_items WHERE category = ? ORDER BY timestamp',
            [category]
        );
        
        const xmlContent = generateTickerXML(items, category);
        const filepath = path.join(XML_DIR, `${category}.xml`);
        fs.writeFileSync(filepath, xmlContent);

        res.json({ message: 'News item deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news item' });
    }
});

export default router;