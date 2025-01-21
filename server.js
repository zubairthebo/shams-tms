const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { authenticateToken, handleLogin } = require('./src/server/auth');
const { saveXML } = require('./src/server/xmlGenerator');
const { USERS_FILE, CATEGORIES_FILE, SETTINGS_FILE } = require('./src/server/config');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

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
app.post('/api/save-xml', authenticateToken, saveXML);

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

// Settings endpoints with file upload
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
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings));
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
