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
export const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

// Ensure directories exist
[DATA_DIR, XML_DIR, UPLOADS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Database tables configuration
export const USERS_TABLE = {
    name: 'users',
    schema: `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(100),
            designation VARCHAR(100),
            email VARCHAR(100),
            role ENUM('admin', 'user') DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `
};

export const USER_CATEGORIES = {
    name: 'user_categories',
    schema: `
        CREATE TABLE IF NOT EXISTS user_categories (
            user_id INT,
            category_id INT,
            PRIMARY KEY (user_id, category_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )
    `
};

export const CATEGORIES_TABLE = {
    name: 'categories',
    schema: `
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(50) UNIQUE NOT NULL,
            name_ar VARCHAR(100) NOT NULL,
            name_en VARCHAR(100) NOT NULL,
            main_scene_name VARCHAR(100) DEFAULT 'MAIN_TICKER',
            opener_template_name VARCHAR(100),
            template_name VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `
};

export const SETTINGS_TABLE = {
    name: 'settings',
    schema: `
        CREATE TABLE IF NOT EXISTS settings (
            id INT PRIMARY KEY DEFAULT 1,
            company_name VARCHAR(100),
            logo_path VARCHAR(255),
            favicon_path VARCHAR(255),
            website_url VARCHAR(255),
            email VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CHECK (id = 1)
        )
    `
};

export const NEWS_TABLE = {
    name: 'news_items',
    schema: `
        CREATE TABLE IF NOT EXISTS news_items (
            id VARCHAR(36) PRIMARY KEY,
            text TEXT NOT NULL,
            category_id INT NOT NULL,
            created_by INT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `
};