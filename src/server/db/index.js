import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a connection pool without specifying a database
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const initializeDatabase = async () => {
    try {
        // First create the database
        const connection = await pool.getConnection();
        await connection.query('CREATE DATABASE IF NOT EXISTS news_ticker');
        connection.release();

        // Create a new pool with the database specified
        const dbPool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'news_ticker',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Read and execute the table creation SQL
        const createTablesSql = fs.readFileSync(path.join(__dirname, 'tables.sql'), 'utf8');
        const dbConnection = await dbPool.getConnection();
        
        // Split the SQL into individual statements and execute them
        const statements = createTablesSql.split(';').filter(stmt => stmt.trim());
        for (const statement of statements) {
            if (statement.trim()) {
                await dbConnection.query(statement);
            }
        }
        
        dbConnection.release();
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
        await connection.query('USE news_ticker');
        
        const statements = seedSql.split(';').filter(stmt => stmt.trim());
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }
        
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
        await connection.query('USE news_ticker');
        
        const statements = clearSql.split(';').filter(stmt => stmt.trim());
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }
        
        connection.release();
        console.log('Database cleared successfully');
    } catch (error) {
        console.error('Error clearing database:', error);
        throw error;
    }
};

// Export a pool that's already connected to the news_ticker database
const dbPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'news_ticker',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default dbPool;