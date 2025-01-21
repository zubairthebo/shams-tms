import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { JWT_SECRET, USERS_FILE } from './config.js';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

export const handleLogin = (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username });

    try {
        // Ensure users.json exists and is readable
        if (!fs.existsSync(USERS_FILE)) {
            const defaultUsers = {
                users: [{
                    username: 'admin',
                    // Default password: admin123
                    password: '$2a$10$zGqHJj7SKvU/BzQe5Xc7n.7vFqE3Qc3/p1fIHYwF0c7UyV7NFWqPe',
                    role: 'admin',
                    assignedCategories: []
                }]
            };
            fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
        }

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
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};