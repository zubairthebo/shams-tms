import fs from 'fs';
import path from 'path';
import { XML_DIR } from './config.js';

const generateRSS2 = (items, category) => {
    const now = new Date().toUTCString();
    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
    <channel>
        <title>ShamsTV News - ${category}</title>
        <link>https://shams.tv</link>
        <description>Latest news from ShamsTV</description>
        <language>ar</language>
        <pubDate>${now}</pubDate>
        <lastBuildDate>${now}</lastBuildDate>
        ${items.map(item => `
        <item>
            <title>${item.text.substring(0, 100)}</title>
            <description>${item.text}</description>
            <pubDate>${new Date(item.timestamp).toUTCString()}</pubDate>
            <category>${category}</category>
        </item>
        `).join('')}
    </channel>
</rss>`;
};

export const saveXML = (req, res) => {
    const { xml, category } = req.body;
    
    if (req.user.role !== 'admin' && !req.user.assignedCategories.includes(category)) {
        return res.status(403).json({ error: 'Unauthorized category access' });
    }

    const filename = `${category}.xml`;
    const filepath = path.join(XML_DIR, filename);

    // Convert to RSS 2.0 format
    const rss2Xml = generateRSS2([{
        text: xml,
        timestamp: new Date(),
        category
    }], category);

    fs.writeFile(filepath, rss2Xml, (err) => {
        if (err) {
            console.error('Error saving XML:', err);
            res.status(500).json({ error: 'Failed to save XML' });
            return;
        }
        res.json({ message: 'XML saved successfully', filename });
    });
};