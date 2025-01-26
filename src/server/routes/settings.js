import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../auth.js';
import dbPool from '../db/index.js';
import { UPLOADS_DIR } from '../config.js';

const router = express.Router();

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

router.get('/settings', async (req, res) => {
    try {
        const [settings] = await dbPool.query('SELECT * FROM settings WHERE id = 1');
        res.json(settings[0] || {
            companyName: 'ShamsTV',
            logo: '',
            website: 'https://shams.tv',
            email: 'info@shams.tv',
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: ''
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

router.put('/settings', authenticateToken, upload.fields([
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
            INSERT INTO settings (
                id, 
                company_name, 
                logo_path, 
                website, 
                email,
                facebook,
                twitter,
                instagram,
                linkedin
            )
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            company_name = VALUES(company_name),
            logo_path = VALUES(logo_path),
            website = VALUES(website),
            email = VALUES(email),
            facebook = VALUES(facebook),
            twitter = VALUES(twitter),
            instagram = VALUES(instagram),
            linkedin = VALUES(linkedin)
        `, [
            settings.companyName,
            settings.logo,
            settings.website,
            settings.email,
            settings.facebook,
            settings.twitter,
            settings.instagram,
            settings.linkedin
        ]);

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

export default router;