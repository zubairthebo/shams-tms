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
    const users = JSON.parse(fs.readFileSync(USERS_FILE)).users;
    const user = users.find(u => u.username === username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
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

    res.json({ token, user: { 
        username: user.username, 
        role: user.role,
        assignedCategories: user.assignedCategories 
    }});
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

// Save XML when news is submitted
app.post('/api/save-xml', authenticateToken, (req, res) => {
    const { xml, category } = req.body;
    
    // Check if user has permission for this category
    if (req.user.role !== 'admin' && !req.user.assignedCategories.includes(category)) {
        return res.status(403).json({ error: 'Unauthorized category access' });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `news_${timestamp}.xml`;
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Default admin credentials:', {
        username: 'admin',
        password: 'admin123'
    });
});