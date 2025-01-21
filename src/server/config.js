import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const JWT_SECRET = 'your-secret-key'; // In production, use environment variable
export const DATA_DIR = path.join(__dirname, '..', '..', 'data');
export const XML_DIR = path.join(__dirname, '..', '..', 'xml');
export const USERS_FILE = path.join(DATA_DIR, 'users.json');
export const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
export const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure directories exist
[XML_DIR, DATA_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});