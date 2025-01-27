import fs from 'fs';
import path from 'path';
import { XML_DIR } from '../config.js';
import dbPool from '../db/index.js';

const escapeXml = (text) => {
  if (!text) return '';
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

export const generateCategoryXML = async (categoryId) => {
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

    // Get only news items for this specific category
    const [items] = await dbPool.query(
      'SELECT * FROM news_items WHERE category_id = ? ORDER BY created_at DESC',
      [categoryId]
    );

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

    const filename = `${categoryId}.xml`;
    const filepath = path.join(XML_DIR, filename);
    fs.writeFileSync(filepath, xmlContent);

    return filename;
  } catch (error) {
    console.error('Error generating XML:', error);
    throw error;
  }
};

export default { generateCategoryXML };