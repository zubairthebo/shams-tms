import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'news_ticker',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const initializeDatabase = async () => {
    try {
        const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
        const connection = await pool.getConnection();
        await connection.query(initSql);
        connection.release();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

export const seedDatabase = async () => {
    try {
        const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
        const connection = await pool.getConnection();
        await connection.query(seedSql);
        connection.release();
        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
};

export const clearDatabase = async () => {
    try {
        const clearSql = fs.readFileSync(path.join(__dirname, 'clear.sql'), 'utf8');
        const connection = await pool.getConnection();
        await connection.query(clearSql);
        connection.release();
        console.log('Database cleared successfully');
    } catch (error) {
        console.error('Error clearing database:', error);
        throw error;
    }
};

export default pool;