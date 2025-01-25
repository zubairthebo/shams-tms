import express from 'express';
import { authenticateToken } from '../auth.js';
import dbPool from '../db/index.js';

const router = express.Router();

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await dbPool.query(`
            SELECT 
                identifier,
                name_ar as ar,
                name_en as en,
                main_scene_name as mainSceneName,
                opener_template_name as openerTemplateName,
                template_name as templateName
            FROM categories
        `);
        
        // Transform array to object with identifier as key
        const formattedCategories = categories.reduce((acc, category) => {
            const { identifier, ...rest } = category;
            acc[identifier] = rest;
            return acc;
        }, {});

        res.json(formattedCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Create new category (admin only)
router.post('/categories', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const { identifier, ar, en, mainSceneName, openerTemplateName, templateName } = req.body;
        
        await dbPool.query(`
            INSERT INTO categories (
                identifier, 
                name_ar, 
                name_en, 
                main_scene_name, 
                opener_template_name, 
                template_name
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [identifier, ar, en, mainSceneName, openerTemplateName, templateName]);
        
        res.status(201).json({ message: 'Category created successfully' });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// Update category (admin only)
router.put('/categories/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const { id } = req.params;
        const { ar, en, mainSceneName, openerTemplateName, templateName } = req.body;
        
        await dbPool.query(`
            UPDATE categories 
            SET 
                name_ar = ?,
                name_en = ?,
                main_scene_name = ?,
                opener_template_name = ?,
                template_name = ?
            WHERE identifier = ?
        `, [ar, en, mainSceneName, openerTemplateName, templateName, id]);
        
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Delete category (admin only)
router.delete('/categories/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const { id } = req.params;
        const [result] = await dbPool.query('DELETE FROM categories WHERE identifier = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

export default router;