import { initializeDatabase, seedDatabase } from '../db/index.js';

const setup = async () => {
    try {
        console.log('Starting database setup...');
        
        console.log('Initializing database structure...');
        await initializeDatabase();
        
        console.log('Seeding initial data...');
        await seedDatabase();
        
        console.log('Database setup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    }
};

setup();