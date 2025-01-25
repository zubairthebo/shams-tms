import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticateToken } from '../auth.js';
import dbPool from '../db/index.js';

const router = express.Router();

// Get all users
router.get('/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const [users] = await dbPool.query(`
            SELECT u.username, u.name, u.designation, u.email, u.role,
                   GROUP_CONCAT(c.identifier) as assignedCategories
            FROM users u
            LEFT JOIN user_categories uc ON u.id = uc.user_id
            LEFT JOIN categories c ON uc.category_id = c.id
            GROUP BY u.id
        `);

        const formattedUsers = users.map(user => ({
            ...user,
            assignedCategories: user.assignedCategories ? user.assignedCategories.split(',') : []
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create new user
router.post('/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { username, password, name, designation, email, assignedCategories } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await dbPool.query(
            'INSERT INTO users (username, password, name, designation, email) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, name, designation, email]
        );

        if (assignedCategories && assignedCategories.length > 0) {
            const [categories] = await dbPool.query(
                'SELECT id, identifier FROM categories WHERE identifier IN (?)',
                [assignedCategories]
            );

            const userCategoryValues = categories.map(category => [result.insertId, category.id]);
            
            if (userCategoryValues.length > 0) {
                await dbPool.query(
                    'INSERT INTO user_categories (user_id, category_id) VALUES ?',
                    [userCategoryValues]
                );
            }
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user
router.put('/users/:username', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { username } = req.params;
    const { password, name, designation, email, assignedCategories } = req.body;

    try {
        const updates = [];
        const values = [];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push('password = ?');
            values.push(hashedPassword);
        }
        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (designation) {
            updates.push('designation = ?');
            values.push(designation);
        }
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }

        values.push(username);

        if (updates.length > 0) {
            await dbPool.query(
                `UPDATE users SET ${updates.join(', ')} WHERE username = ?`,
                values
            );
        }

        // Update assigned categories
        const [userResult] = await dbPool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (userResult.length > 0) {
            const userId = userResult[0].id;

            // Remove existing category assignments
            await dbPool.query('DELETE FROM user_categories WHERE user_id = ?', [userId]);

            // Add new category assignments
            if (assignedCategories && assignedCategories.length > 0) {
                const [categories] = await dbPool.query(
                    'SELECT id, identifier FROM categories WHERE identifier IN (?)',
                    [assignedCategories]
                );

                const userCategoryValues = categories.map(category => [userId, category.id]);
                
                if (userCategoryValues.length > 0) {
                    await dbPool.query(
                        'INSERT INTO user_categories (user_id, category_id) VALUES ?',
                        [userCategoryValues]
                    );
                }
            }
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

export default router;