import fs from 'fs';
import path from 'path';
import { XML_DIR } from './config.js';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'news_ticker'
});

const generateTickerXML = async (items, categoryId) => {
    try {
        const [categories] = await pool.execute(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        if (!categories.length) {
            throw new Error('Category not found');
        }

        const category = categories[0];
        const mainSceneName = category.main_scene_name || 'MAIN_TICKER';
        const openerTemplateName = category.opener_template_name || `TICKER_${category.identifier.toUpperCase()}_START`;
        const templateName = category.template_name || `TICKER_${category.identifier.toUpperCase()}`;

        const safeText = (text) => {
            if (!text || typeof text !== 'string') return '';
            return text.replace(/[<>&'"]/g, (char) => {
                switch (char) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case "'": return '&apos;';
                    case '"': return '&quot;';
                    default: return char;
                }
            });
        };

        // Generate XML content specific to this category
        return `<?xml version="1.0" encoding="UTF-8"?>
<tickerfeed version="2.4">
    <playlist type="flipping_carousel" name="${mainSceneName}" target="carousel">
        <defaults>
            <template>${openerTemplateName}</template>
        </defaults>
        <element />
    </playlist>
    <playlist type="flipping_carousel" name="${mainSceneName}" target="carousel">
        <defaults>
            <template>${templateName}</template>
            <attributes>
                <attribute name="custom_attribute">custom value</attribute>
            </attributes>
        </defaults>
        ${items.map(item => `
        <element>
            <field name="1">${safeText(item.text)}</field>
        </element>`).join('')}
    </playlist>
</tickerfeed>`;
    } catch (error) {
        console.error('Error generating XML:', error);
        throw error;
    }
};

export const saveXML = async (req, res) => {
    try {
        const { text, categoryId } = req.body;
        
        if (!text || !categoryId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check user permissions
        const [userCategories] = await pool.execute(
            'SELECT category_id FROM user_categories WHERE user_id = ?',
            [req.user.id]
        );

        const allowedCategories = userCategories.map(uc => uc.category_id);
        if (req.user.role !== 'admin' && !allowedCategories.includes(categoryId)) {
            return res.status(403).json({ error: 'Unauthorized category access' });
        }

        // Get category identifier for filename
        const [categories] = await pool.execute(
            'SELECT identifier FROM categories WHERE id = ?',
            [categoryId]
        );

        if (!categories.length) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const category = categories[0];
        const filename = `${category.identifier}.xml`;
        const filepath = path.join(XML_DIR, filename);

        // Ensure XML directory exists
        if (!fs.existsSync(XML_DIR)) {
            fs.mkdirSync(XML_DIR, { recursive: true });
        }

        // Get only items for this specific category
        const [items] = await pool.execute(
            'SELECT * FROM news_items WHERE category_id = ? ORDER BY timestamp DESC',
            [categoryId]
        );

        const xmlContent = await generateTickerXML(items, categoryId);
        fs.writeFileSync(filepath, xmlContent);
        
        res.json({ message: 'XML saved successfully', filename });
    } catch (error) {
        console.error('Error saving XML:', error);
        res.status(500).json({ error: 'Failed to save XML' });
    }
};

export default { generateTickerXML, saveXML };