import { initializeDatabase, seedDatabase } from '../db/index.js';

const setup = async () => {
    try {
        console.log('Initializing database...');
        await initializeDatabase();
        
        console.log('Seeding database...');
        await seedDatabase();
        
        console.log('Database setup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during database setup:', error);
        process.exit(1);
    }
};

setup();