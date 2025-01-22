import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../auth.js';
import { SETTINGS_FILE } from '../config.js';
import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
});

const upload = multer({ storage: storage });

router.get('/settings', (req, res) => {
    try {
        if (!fs.existsSync(SETTINGS_FILE)) {
            const defaultSettings = {
                companyName: 'ShamsTV',
                logo: '',
                website: 'https://shams.tv',
                email: 'info@shams.tv'
            };
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
            return res.json(defaultSettings);
        }
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE));
        res.json(settings);
    } catch (error) {
        console.error('Error reading settings:', error);
        res.status(500).json({ error: 'Failed to read settings' });
    }
});

router.put('/settings', authenticateToken, upload.fields([
    { name: 'logo', maxCount: 1 }
]), (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const settings = JSON.parse(req.body.settings);
        if (req.files?.logo) {
            settings.logo = `/uploads/${req.files.logo[0].filename}`;
        }
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

export default router;