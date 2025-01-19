const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Ensure the xml directory exists
const xmlDir = path.join(__dirname, 'xml');
if (!fs.existsSync(xmlDir)) {
    fs.mkdirSync(xmlDir);
}

app.post('/api/save-xml', (req, res) => {
    const { xml } = req.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `news_${timestamp}.xml`;
    const filepath = path.join(xmlDir, filename);

    fs.writeFile(filepath, xml, (err) => {
        if (err) {
            console.error('Error saving XML:', err);
            res.status(500).json({ error: 'Failed to save XML' });
            return;
        }
        res.json({ message: 'XML saved successfully', filename });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});