import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticateToken, handleLogin } from './src/server/auth.js';
import { saveXML } from './src/server/xmlGenerator.js';
import { USERS_FILE, CATEGORIES_FILE, SETTINGS_FILE, XML_DIR } from './src/server/config.js';
import fs from 'fs';
import bcrypt from 'bcryptjs';

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
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
});

const upload = multer({ storage: storage });

// Routes
app.post('/api/login', handleLogin);
app.post('/api/save-xml', authenticateToken, (req, res) => {
    try {
        const { text, category } = req.body;
        
        // Add detailed validation
        if (!text || !category) {
            console.log('Missing fields:', { text, category }); // Debug log
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: {
                    text: !text ? 'Text is required' : null,
                    category: !category ? 'Category is required' : null
                }
            });
        }

        if (req.user.role !== 'admin' && !req.user.assignedCategories.includes(category)) {
            return res.status(403).json({ error: 'Unauthorized category access' });
        }

        // Ensure XML directory exists
        if (!fs.existsSync(XML_DIR)) {
            fs.mkdirSync(XML_DIR, { recursive: true });
        }

        const filename = `${category}.xml`;
        const filepath = path.join(XML_DIR, filename);
        
        // Generate and save XML content
        const xmlContent = generateTickerXML([{
            text,
            timestamp: new Date(),
            category
        }], category);

        fs.writeFileSync(filepath, xmlContent);
        
        res.json({ message: 'XML saved successfully', filename });
    } catch (error) {
        console.error('Error saving XML:', error);
        res.status(500).json({ error: 'Failed to save XML' });
    }
});

// Categories endpoints
app.get('/api/categories', (req, res) => {
    try {
        if (!fs.existsSync(CATEGORIES_FILE)) {
            return res.status(404).json({ error: 'Categories file not found' });
        }
        const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE));
        res.json(categories);
    } catch (error) {
        console.error('Error reading categories:', error);
        res.status(500).json({ error: 'Failed to read categories' });
    }
});

app.put('/api/categories/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const { id } = req.params;
        const { ar, en } = req.body;
        
        const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE));
        categories[id] = { ar, en };
        
        fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
    try {
        if (!fs.existsSync(SETTINGS_FILE)) {
            const defaultSettings = {
                companyName: 'ShamsTV',
                logo: '',
                favicon: '',
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

app.put('/api/settings', authenticateToken, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
]), (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const settings = JSON.parse(req.body.settings);
        if (req.files) {
            if (req.files.logo) {
                settings.logo = `/uploads/${req.files.logo[0].filename}`;
            }
            if (req.files.favicon) {
                settings.favicon = `/uploads/${req.files.favicon[0].filename}`;
            }
        }
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// User management endpoints
app.post('/api/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { username, password, assignedCategories } = req.body;
    const userData = JSON.parse(fs.readFileSync(USERS_FILE));
    
    if (userData.users.some(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    const newUser = {
        username,
        password: bcrypt.hashSync(password, 10),
        role: 'user',
        assignedCategories
    };

    userData.users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(userData));
    
    res.json({ message: 'User created successfully' });
});

app.put('/api/users/:username', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { username } = req.params;
    const { password, assignedCategories, role } = req.body;
    
    const userData = JSON.parse(fs.readFileSync(USERS_FILE));
    const userIndex = userData.users.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (password) {
        userData.users[userIndex].password = bcrypt.hashSync(password, 10);
    }
    
    if (assignedCategories) {
        userData.users[userIndex].assignedCategories = assignedCategories;
    }
    
    if (role) {
        userData.users[userIndex].role = role;
    }

    fs.writeFileSync(USERS_FILE, JSON.stringify(userData));
    res.json({ message: 'User updated successfully' });
});

app.get('/api/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const userData = JSON.parse(fs.readFileSync(USERS_FILE));
    const sanitizedUsers = userData.users.map(({ password, ...user }) => user);
    res.json(sanitizedUsers);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
