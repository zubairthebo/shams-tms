import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET } from './config.js';
import dbPool from './db/index.js';

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get fresh user data from database
        const [users] = await dbPool.query(
            'SELECT id, username, role FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(403).json({ error: 'User not found' });
        }

        const user = users[0];

        // Get assigned categories
        const [categories] = await dbPool.query(`
            SELECT c.identifier 
            FROM categories c 
            INNER JOIN user_categories uc ON c.id = uc.category_id 
            WHERE uc.user_id = ?
        `, [user.id]);

        req.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            assignedCategories: categories.map(c => c.identifier)
        };
        
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(403).json({ error: 'Invalid token' });
    }
};

export const handleLogin = async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    try {
        // Get user from database
        const [users] = await dbPool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            console.log('User not found:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Invalid password for user:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Get assigned categories
        const [categories] = await dbPool.query(`
            SELECT c.identifier 
            FROM categories c 
            INNER JOIN user_categories uc ON c.id = uc.category_id 
            WHERE uc.user_id = ?
        `, [user.id]);

        // Generate token
        const token = jwt.sign(
            { 
                id: user.id,
                username: user.username,
                role: user.role
            }, 
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful for user:', username);
        res.json({ 
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                designation: user.designation,
                email: user.email,
                role: user.role,
                assignedCategories: categories.map(c => c.identifier)
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};