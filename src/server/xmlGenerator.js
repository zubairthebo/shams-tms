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
            'SELECT * FROM categories WHERE identifier = ?',
            [categoryId]
        );

        if (!categories.length) {
            throw new Error('Category not found');
        }

        const category = categories[0];
        const mainSceneName = category.main_scene_name || 'MAIN_TICKER';

        // Return minimal XML structure when no items
        if (!items || items.length === 0) {
            return `<?xml version="1.0" encoding="UTF-8"?>
<tickerfeed version="2.4">
<playlist type="flipping_carousel" name="${mainSceneName}" target="carousel">
</playlist>
</tickerfeed>`;
        }

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

        const templateName = category.template_name || `TICKER_${categoryId.toUpperCase()}`;

        // Generate XML content with items
        return `<?xml version="1.0" encoding="UTF-8"?>
<tickerfeed version="2.4">
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
        const { categoryId } = req.body;
        
        if (!categoryId) {
            return res.status(400).json({ error: 'Missing category ID' });
        }

        // Get category ID from identifier
        const [categoryResult] = await pool.execute(
            'SELECT id FROM categories WHERE identifier = ?',
            [categoryId]
        );

        if (categoryResult.length === 0) {
            return res.status(400).json({ error: 'Category not found' });
        }

        const category = categoryResult[0];

        // Check user permissions
        const [userCategories] = await pool.execute(
            'SELECT c.identifier FROM categories c JOIN user_categories uc ON c.id = uc.category_id WHERE uc.user_id = ?',
            [req.user.id]
        );

        const allowedCategories = userCategories.map(uc => uc.identifier);
        if (req.user.role !== 'admin' && !allowedCategories.includes(categoryId)) {
            return res.status(403).json({ error: 'Unauthorized category access' });
        }

        // Get items for this specific category
        const [items] = await pool.execute(
            'SELECT * FROM news_items WHERE category_id = ? ORDER BY created_at DESC',
            [category.id]
        );

        const xmlContent = await generateTickerXML(items, categoryId);
        
        // Ensure XML directory exists
        if (!fs.existsSync(XML_DIR)) {
            fs.mkdirSync(XML_DIR, { recursive: true });
        }
        
        const filename = `${categoryId}.xml`;
        const filepath = path.join(XML_DIR, filename);
        fs.writeFileSync(filepath, xmlContent);
        
        return res.json({ message: 'XML saved successfully', filename });
    } catch (error) {
        console.error('Error saving XML:', error);
        return res.status(500).json({ error: 'Failed to save XML', details: error.message });
    }
};

export default { generateTickerXML, saveXML };