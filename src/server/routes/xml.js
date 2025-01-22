import express from 'express';
import { authenticateToken } from '../auth.js';
import { XML_DIR } from '../config.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

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

router.post('/save-xml', authenticateToken, (req, res) => {
    try {
        const { text, category } = req.body;
        
        if (!text || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (req.user.role !== 'admin' && !req.user.assignedCategories.includes(category)) {
            return res.status(403).json({ error: 'Unauthorized category access' });
        }

        if (!fs.existsSync(XML_DIR)) {
            fs.mkdirSync(XML_DIR, { recursive: true });
        }

        const filename = `${category}.xml`;
        const filepath = path.join(XML_DIR, filename);
        
        let existingItems = [];
        if (fs.existsSync(filepath)) {
            const xmlContent = fs.readFileSync(filepath, 'utf-8');
            const matches = xmlContent.match(/<field name="1">(.*?)<\/field>/g);
            if (matches) {
                existingItems = matches.map(match => ({
                    text: match.replace(/<field name="1">(.*?)<\/field>/, '$1')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&apos;/g, "'")
                        .replace(/&quot;/g, '"'),
                    timestamp: new Date(),
                    category
                }));
            }
        }

        existingItems.push({
            text,
            timestamp: new Date(),
            category
        });

        const xmlContent = generateTickerXML(existingItems, category);
        fs.writeFileSync(filepath, xmlContent);
        
        res.json({ message: 'XML saved successfully', filename });
    } catch (error) {
        console.error('Error saving XML:', error);
        res.status(500).json({ error: 'Failed to save XML' });
    }
});

export default router;