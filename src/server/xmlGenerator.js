import fs from 'fs';
import path from 'path';
import { XML_DIR } from './config.js';

const generateTickerXML = (items, category) => {
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

    return `<?xml version="1.0" encoding="UTF-8"?>
<tickerfeed version="2.4">
  <playlist type="flipping_carousel" name="MAIN_TICKER" target="carousel">
    <defaults>
      <template>TICKER_${category.toUpperCase()}_START</template>
    </defaults>
    <element />
  </playlist>
  <playlist type="flipping_carousel" name="MAIN_TICKER" target="carousel">
    <defaults>
      <template>TICKER_${category.toUpperCase()}</template>
      <attributes>
        <attribute name="custom_attribute">custom value</attribute>
      </attributes>
    </defaults>
    ${items.map((item, index) => `
    <element>
      <field name="1">${safeText(item.text)}</field>
    </element>`).join('')}
  </playlist>
</tickerfeed>`;
};

export const saveXML = (req, res) => {
    try {
        const { xml, category } = req.body;
        
        if (!xml || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (req.user.role !== 'admin' && !req.user.assignedCategories.includes(category)) {
            return res.status(403).json({ error: 'Unauthorized category access' });
        }

        const filename = `${category}.xml`;
        const filepath = path.join(XML_DIR, filename);

        const xmlContent = generateTickerXML([{
            text: xml,
            timestamp: new Date(),
            category
        }], category);

        fs.writeFileSync(filepath, xmlContent);
        res.json({ message: 'XML saved successfully', filename });
    } catch (error) {
        console.error('Error saving XML:', error);
        res.status(500).json({ error: 'Failed to save XML' });
    }
};