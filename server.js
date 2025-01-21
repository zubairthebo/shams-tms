const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const XML_DIR = path.join(__dirname, 'xml');
const CATEGORIES_FILE = path.join(__dirname, 'data', 'categories.json');

// Ensure directories exist
[XML_DIR, path.dirname(USERS_FILE)].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Initialize users.json if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
    const defaultAdmin = {
        username: 'admin',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        assignedCategories: []
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [defaultAdmin] }));
}

// Initialize categories.json if it doesn't exist
if (!fs.existsSync(CATEGORIES_FILE)) {
    const defaultCategories = {
        politics: { ar: 'سياسة', en: 'Politics' },
        sports: { ar: 'رياضة', en: 'Sports' },
        economy: { ar: 'اقتصاد', en: 'Economy' },
        technology: { ar: 'تكنولوجيا', en: 'Technology' }
    };
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(defaultCategories));
}

// Initialize settings.json if it doesn't exist
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');
if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
        companyName: 'ShamsTV',
        website: 'https://shams.tv',
        email: 'zubair@shams.tv',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: ''
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings));
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username }); // Add logging

    // Read users from file
    const userData = JSON.parse(fs.readFileSync(USERS_FILE));
    const user = userData.users.find(u => u.username === username);
    
    console.log('User found:', user ? 'yes' : 'no'); // Add logging

    if (!user || !bcrypt.compareSync(password, user.password)) {
        console.log('Login failed: Invalid credentials'); // Add logging
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { 
            username: user.username, 
            role: user.role,
            assignedCategories: user.assignedCategories 
        }, 
        JWT_SECRET
    );

    console.log('Login successful'); // Add logging
    res.json({ 
        token, 
        user: { 
            username: user.username, 
            role: user.role,
            assignedCategories: user.assignedCategories 
        }
    });
});

// Admin endpoint to manage users
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

// Update user endpoint
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

// Get all users endpoint
app.get('/api/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const userData = JSON.parse(fs.readFileSync(USERS_FILE));
    // Remove password hashes from response
    const sanitizedUsers = userData.users.map(({ password, ...user }) => user);
    res.json(sanitizedUsers);
});

// Save XML when news is submitted
app.post('/api/save-xml', authenticateToken, (req, res) => {
    const { xml, category } = req.body;
    
    // Check if user has permission for this category
    if (req.user.role !== 'admin' && !req.user.assignedCategories.includes(category)) {
        return res.status(403).json({ error: 'Unauthorized category access' });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${category}.xml`;
    const filepath = path.join(XML_DIR, filename);

    fs.writeFile(filepath, xml, (err) => {
        if (err) {
            console.error('Error saving XML:', err);
            res.status(500).json({ error: 'Failed to save XML' });
            return;
        }
        res.json({ message: 'XML saved successfully', filename });
    });
});

// Get categories
app.get('/api/categories', (req, res) => {
    const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE));
    res.json(categories);
});

// Add/Update category
app.put('/api/categories/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { ar, en } = req.body;
    
    const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE));
    categories[id] = { ar, en };
    
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories));
    res.json({ message: 'Category updated successfully' });
});

// Delete category
app.delete('/api/categories/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE));
    
    if (!categories[id]) {
        return res.status(404).json({ error: 'Category not found' });
    }
    
    delete categories[id];
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories));
    res.json({ message: 'Category deleted successfully' });
});

// Get settings
app.get('/api/settings', (req, res) => {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE));
    res.json(settings);
});

// Update settings
app.put('/api/settings', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const settings = req.body;
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings));
    res.json({ message: 'Settings updated successfully' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Default admin credentials:', {
        username: 'admin',
        password: 'admin123'
    });
});
