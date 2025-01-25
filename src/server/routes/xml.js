import express from 'express';
import { authenticateToken } from '../auth.js';
import dbPool from '../db/index.js';
import fs from 'fs';
import path from 'path';
import { XML_DIR } from '../config.js';

const router = express.Router();

router.post('/save-xml', authenticateToken, async (req, res) => {
    try {
        const { text, categoryId } = req.body;
        
        if (!text || !categoryId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get category details using identifier
        const [categories] = await dbPool.query(
            'SELECT * FROM categories WHERE identifier = ?',
            [categoryId]
        );

        if (categories.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const category = categories[0];

        // Check user permissions if not admin
        if (req.user.role !== 'admin') {
            const [hasAccess] = await dbPool.query(`
                SELECT 1 FROM user_categories uc
                JOIN categories c ON uc.category_id = c.id 
                WHERE uc.user_id = ? AND c.identifier = ?
            `, [req.user.id, categoryId]);

            if (hasAccess.length === 0) {
                return res.status(403).json({ error: 'Unauthorized category access' });
            }
        }

        // Generate XML content
        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<tickerfeed version="2.4">
    <playlist type="flipping_carousel" name="${category.main_scene_name}" target="carousel">
        <defaults>
            <template>${category.opener_template_name}</template>
        </defaults>
        <element />
    </playlist>
    <playlist type="flipping_carousel" name="${category.main_scene_name}" target="carousel">
        <defaults>
            <template>${category.template_name}</template>
            <attributes>
                <attribute name="custom_attribute">custom value</attribute>
            </attributes>
        </defaults>
        <element>
            <field name="1">${text.replace(/[<>&'"]/g, char => {
                switch (char) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case "'": return '&apos;';
                    case '"': return '&quot;';
                    default: return char;
                }
            })}</field>
        </element>
    </playlist>
</tickerfeed>`;

        // Ensure XML directory exists
        if (!fs.existsSync(XML_DIR)) {
            fs.mkdirSync(XML_DIR, { recursive: true });
        }

        // Save XML file
        const filename = `${categoryId}.xml`;
        const filepath = path.join(XML_DIR, filename);
        fs.writeFileSync(filepath, xmlContent);
        
        res.json({ message: 'XML saved successfully', filename });
    } catch (error) {
        console.error('Error saving XML:', error);
        res.status(500).json({ error: 'Failed to save XML' });
    }
});

export default router;