import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const JWT_SECRET = 'your-secret-key'; // In production, use environment variable
export const DATA_DIR = path.join(__dirname, '..', '..', 'data');
export const XML_DIR = path.join(__dirname, '..', '..', 'xml');
export const USERS_FILE = path.join(DATA_DIR, 'users.json');
export const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
export const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
export const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

// Ensure directories exist
[DATA_DIR, XML_DIR, UPLOADS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Initialize users.json if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = {
        users: [{
            username: 'admin',
            // Default password: admin123
            password: bcrypt.hashSync('admin123', 10),
            role: 'admin',
            assignedCategories: []
        }]
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
}

// Initialize categories.json if it doesn't exist
if (!fs.existsSync(CATEGORIES_FILE)) {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify({ categories: [] }, null, 2));
}

// Initialize settings.json if it doesn't exist
if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
        companyName: 'ShamsTV',
        logo: '',
        favicon: '',
        website: 'https://shams.tv',
        email: 'info@shams.tv',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: ''
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
}