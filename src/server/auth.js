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
                    password: bcrypt.hashSync('admin123', 10),
                    role: 'admin',
                    assignedCategories: []
                }]
            };
            fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
        }

        const userData = JSON.parse(fs.readFileSync(USERS_FILE));
        const user = userData.users.find(u => u.username === username);
        
        if (!user) {
            console.log('Login failed: User not found');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            console.log('Login failed: Invalid password');
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