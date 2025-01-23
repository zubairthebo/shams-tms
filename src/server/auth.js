import jwt from 'jsonwebtoken';
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
        return res.status(403).json({ error: 'Invalid token' });
    }
};