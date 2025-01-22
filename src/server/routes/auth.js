import express from 'express';
import { authenticateToken, handleLogin } from '../auth.js';
import { USERS_FILE } from '../config.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const router = express.Router();

router.post('/login', handleLogin);

router.post('/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { username, password, name, designation, email, assignedCategories } = req.body;
    const userData = JSON.parse(fs.readFileSync(USERS_FILE));
    
    if (userData.users.some(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    const newUser = {
        username,
        password: bcrypt.hashSync(password, 10),
        name,
        designation,
        email,
        role: 'user',
        assignedCategories
    };

    userData.users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(userData));
    
    res.json({ message: 'User created successfully' });
});

router.put('/users/:username', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { username } = req.params;
    const { password, name, designation, email, assignedCategories, role } = req.body;
    
    const userData = JSON.parse(fs.readFileSync(USERS_FILE));
    const userIndex = userData.users.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (password) {
        userData.users[userIndex].password = bcrypt.hashSync(password, 10);
    }
    
    if (name) userData.users[userIndex].name = name;
    if (designation) userData.users[userIndex].designation = designation;
    if (email) userData.users[userIndex].email = email;
    if (assignedCategories) userData.users[userIndex].assignedCategories = assignedCategories;
    if (role) userData.users[userIndex].role = role;

    fs.writeFileSync(USERS_FILE, JSON.stringify(userData));
    res.json({ message: 'User updated successfully' });
});

router.get('/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const userData = JSON.parse(fs.readFileSync(USERS_FILE));
    const sanitizedUsers = userData.users.map(({ password, ...user }) => user);
    res.json(sanitizedUsers);
});

export default router;