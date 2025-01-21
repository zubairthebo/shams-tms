const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { JWT_SECRET, USERS_FILE } = require('./config');

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

const handleLogin = (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username });

    const userData = JSON.parse(fs.readFileSync(USERS_FILE));
    const user = userData.users.find(u => u.username === username);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
        console.log('Login failed: Invalid credentials');
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

    console.log('Login successful');
    res.json({ 
        token, 
        user: { 
            username: user.username, 
            role: user.role,
            assignedCategories: user.assignedCategories 
        }
    });
};

module.exports = {
    authenticateToken,
    handleLogin
};