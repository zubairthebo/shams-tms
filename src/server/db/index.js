import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { DB_CONFIG } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = mysql.createPool(DB_CONFIG);

export const initializeDatabase = async () => {
    const connection = await mysql.createConnection({
        host: DB_CONFIG.host,
        user: DB_CONFIG.user,
        password: DB_CONFIG.password
    });

    try {
        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_CONFIG.database}`);
        await connection.query(`USE ${DB_CONFIG.database}`);

        // Read and execute init.sql
        const initSql = await fs.readFile(path.join(__dirname, 'init.sql'), 'utf8');
        const initStatements = initSql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of initStatements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        await connection.end();
    }
};

export const seedDatabase = async () => {
    try {
        // Read and execute seed.sql
        const seedSql = await fs.readFile(path.join(__dirname, 'seed.sql'), 'utf8');
        const seedStatements = seedSql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of seedStatements) {
            if (statement.trim()) {
                await pool.query(statement);
            }
        }

        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
};

export default pool;