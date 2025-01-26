import fs from 'fs';
import path from 'path';
import { XML_DIR } from '../config.js';
import dbPool from '../db/index.js';

export const generateCategoryXML = async (categoryId: string) => {
    try {
        // Get category settings
        const [categories] = await dbPool.query(
            'SELECT * FROM categories WHERE identifier = ?',
            [categoryId]
        );

        if (!categories.length) {
            throw new Error('Category not found');
        }

        const category = categories[0];

        // Get all news items for this category
        const [items] = await dbPool.query(
            'SELECT * FROM news_items WHERE category_id = ? ORDER BY created_at DESC',
            [categoryId]
        );

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
        ${items.map(item => `
        <element>
            <field name="1">${escapeXml(item.text)}</field>
        </element>`).join('')}
    </playlist>
</tickerfeed>`;

        // Ensure XML directory exists
        if (!fs.existsSync(XML_DIR)) {
            fs.mkdirSync(XML_DIR, { recursive: true });
        }

        const filename = `${categoryId}.xml`;
        const filepath = path.join(XML_DIR, filename);
        fs.writeFileSync(filepath, xmlContent);

        return filename;
    } catch (error) {
        console.error('Error generating XML:', error);
        throw error;
    }
};

const escapeXml = (text: string) => {
    return text.replace(/[<>&'"]/g, char => {
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