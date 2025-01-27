import fs from 'fs';
import path from 'path';
import { XML_DIR } from '../config.js';
import dbPool from '../db/index.js';

/**
 * Generates and saves XML content for a specific category
 */
export const generateCategoryXML = async (categoryId) => {
    try {
        // Get category details
        const [categories] = await dbPool.execute(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        if (!categories.length) {
            throw new Error('Category not found');
        }

        const category = categories[0];

        // Get all news items for this category only
        const [items] = await dbPool.execute(
            'SELECT * FROM news_items WHERE category_id = ? ORDER BY created_at DESC',
            [categoryId]
        );

        // Define template names based on category
        const mainSceneName = category.main_scene_name || 'MAIN_TICKER';
        const openerTemplateName = category.opener_template_name || `TICKER_${category.identifier.toUpperCase()}_START`;
        const templateName = category.template_name || `TICKER_${category.identifier.toUpperCase()}`;

        // Generate XML content
        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
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
            <field name="1">${escapeXml(item.text)}</field>
        </element>`).join('')}
    </playlist>
</tickerfeed>`;

        // Ensure XML directory exists
        if (!fs.existsSync(XML_DIR)) {
            fs.mkdirSync(XML_DIR, { recursive: true });
        }

        // Save XML file using category identifier
        const filename = `${category.identifier}.xml`;
        const filepath = path.join(XML_DIR, filename);
        fs.writeFileSync(filepath, xmlContent);

        return { success: true, filename };
    } catch (error) {
        console.error('Error generating XML:', error);
        throw error;
    }
};

/**
 * Escapes special characters for XML content
 */
const escapeXml = (text) => {
    if (!text || typeof text !== 'string') return '';
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

export default { generateCategoryXML };