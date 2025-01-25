import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import authRoutes from './server/routes/auth.js';
import settingsRoutes from './server/routes/settings.js';
import categoriesRoutes from './server/routes/categories.js';
import xmlRoutes from './server/routes/xml.js';
import usersRoutes from './server/routes/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api', settingsRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', xmlRoutes);
app.use('/api', usersRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});