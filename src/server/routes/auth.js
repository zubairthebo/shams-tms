import express from 'express';
import { authenticateToken } from '../auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import dbPool from '../db/index.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username });

    try {
        const [users] = await dbPool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        
        const user = users[0];
        if (!user) {
            console.log('Login failed: User not found');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            console.log('Login failed: Invalid password');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Get assigned categories for the user
        const [categories] = await dbPool.query(
            'SELECT c.identifier FROM categories c INNER JOIN user_categories uc ON c.id = uc.category_id WHERE uc.user_id = ?',
            [user.id]
        );

        const assignedCategories = categories.map(c => c.identifier);

        const token = jwt.sign(
            { 
                id: user.id,
                username: user.username, 
                role: user.role,
                assignedCategories 
            }, 
            JWT_SECRET
        );

        console.log('Login successful');
        res.json({ 
            token, 
            user: { 
                id: user.id,
                username: user.username, 
                name: user.name,
                designation: user.designation,
                email: user.email,
                role: user.role,
                assignedCategories 
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

router.get('/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const [users] = await dbPool.query(`
            SELECT id, username, name, designation, email, role, created_at 
            FROM users
        `);

        // Get categories for each user
        for (let user of users) {
            const [categories] = await dbPool.query(`
                SELECT c.identifier 
                FROM categories c 
                INNER JOIN user_categories uc ON c.id = uc.category_id 
                WHERE uc.user_id = ?
            `, [user.id]);
            
            user.assignedCategories = categories.map(c => c.identifier);
        }

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.post('/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { username, password, name, designation, email, assignedCategories } = req.body;

    try {
        // Start transaction
        const connection = await dbPool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert user
            const [result] = await connection.query(
                'INSERT INTO users (username, password, name, designation, email, role) VALUES (?, ?, ?, ?, ?, ?)',
                [username, bcrypt.hashSync(password, 10), name, designation, email, 'user']
            );

            const userId = result.insertId;

            // Get category IDs
            if (assignedCategories && assignedCategories.length > 0) {
                const [categories] = await connection.query(
                    'SELECT id, identifier FROM categories WHERE identifier IN (?)',
                    [assignedCategories]
                );

                // Insert user-category relationships
                for (const category of categories) {
                    await connection.query(
                        'INSERT INTO user_categories (user_id, category_id) VALUES (?, ?)',
                        [userId, category.id]
                    );
                }
            }

            await connection.commit();
            res.json({ message: 'User created successfully' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

router.put('/users/:username', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { username } = req.params;
    const { password, name, designation, email, assignedCategories, role } = req.body;

    try {
        const connection = await dbPool.getConnection();
        await connection.beginTransaction();

        try {
            // Update user details
            const updates = [];
            const values = [];
            
            if (password) {
                updates.push('password = ?');
                values.push(bcrypt.hashSync(password, 10));
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
            if (role) {
                updates.push('role = ?');
                values.push(role);
            }

            if (updates.length > 0) {
                values.push(username);
                await connection.query(
                    `UPDATE users SET ${updates.join(', ')} WHERE username = ?`,
                    values
                );
            }

            // Update assigned categories if provided
            if (assignedCategories) {
                const [userResult] = await connection.query(
                    'SELECT id FROM users WHERE username = ?',
                    [username]
                );
                
                if (userResult.length > 0) {
                    const userId = userResult[0].id;

                    // Remove existing category assignments
                    await connection.query(
                        'DELETE FROM user_categories WHERE user_id = ?',
                        [userId]
                    );

                    // Add new category assignments
                    if (assignedCategories.length > 0) {
                        const [categories] = await connection.query(
                            'SELECT id, identifier FROM categories WHERE identifier IN (?)',
                            [assignedCategories]
                        );

                        for (const category of categories) {
                            await connection.query(
                                'INSERT INTO user_categories (user_id, category_id) VALUES (?, ?)',
                                [userId, category.id]
                            );
                        }
                    }
                }
            }

            await connection.commit();
            res.json({ message: 'User updated successfully' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

export default router;