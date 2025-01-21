const path = require('path');
const fs = require('fs');

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const XML_DIR = path.join(__dirname, '..', '..', 'xml');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure directories exist
[XML_DIR, DATA_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

module.exports = {
    JWT_SECRET,
    XML_DIR,
    USERS_FILE,
    CATEGORIES_FILE,
    SETTINGS_FILE
};