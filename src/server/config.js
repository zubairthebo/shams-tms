import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const JWT_SECRET = 'your-secret-key'; // In production, use environment variable
export const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

// Database configuration
export const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'news_ticker'
};