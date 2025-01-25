import { initializeDatabase, seedDatabase } from '../db/index.js';

const setup = async () => {
    try {
        await initializeDatabase();
        await seedDatabase();
        console.log('Database setup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during database setup:', error);
        process.exit(1);
    }
};

setup();