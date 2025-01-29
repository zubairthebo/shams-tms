import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticateToken } from './src/server/auth.js';
import { UPLOADS_DIR } from './src/server/config.js';
import dbPool from './src/server/db/index.js';
import newsRoutes from './src/server/routes/news.js';
import usersRoutes from './src/server/routes/users.js';
import categoriesRoutes from './src/server/routes/categories.js';
import authRoutes from './src/server/routes/auth.js';
import xmlRoutes from './src/server/routes/xml.js';
import settingsRoutes from './src/server/routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
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
app.use('/api', authRoutes);
app.use('/api', newsRoutes);
app.use('/api', usersRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', xmlRoutes);
app.use('/api', settingsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});