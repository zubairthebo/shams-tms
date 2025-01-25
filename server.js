import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticateToken, handleLogin } from './src/server/auth.js';
import { UPLOADS_DIR } from './src/server/config.js';
import dbPool from './src/server/db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
});

const upload = multer({ storage: storage });

// Routes
app.post('/api/login', handleLogin);

// Categories endpoints
app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await dbPool.query('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const { id } = req.params;
        const { ar, en } = req.body;
        
        await dbPool.query(
            'UPDATE categories SET name_ar = ?, name_en = ? WHERE identifier = ?',
            [ar, en, id]
        );
        
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Settings endpoints
app.get('/api/settings', async (req, res) => {
    try {
        const [settings] = await dbPool.query('SELECT * FROM settings WHERE id = 1');
        res.json(settings[0] || {
            companyName: 'ShamsTV',
            logo: '',
            website: 'https://shams.tv',
            email: 'info@shams.tv'
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.put('/api/settings', authenticateToken, upload.fields([
    { name: 'logo', maxCount: 1 }
]), async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const settings = JSON.parse(req.body.settings);
        if (req.files?.logo) {
            settings.logo = `/uploads/${req.files.logo[0].filename}`;
        }

        await dbPool.query(`
            INSERT INTO settings (id, company_name, logo_path, website_url, email)
            VALUES (1, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            company_name = VALUES(company_name),
            logo_path = VALUES(logo_path),
            website_url = VALUES(website_url),
            email = VALUES(email)
        `, [settings.companyName, settings.logo, settings.website, settings.email]);

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});