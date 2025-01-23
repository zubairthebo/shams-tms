import { initializeDatabase, seedDatabase, clearDatabase } from '../db/index.js';

const command = process.argv[2];

const runCommand = async () => {
    try {
        switch (command) {
            case 'init':
                await initializeDatabase();
                break;
            case 'seed':
                await seedDatabase();
                break;
            case 'clear':
                await clearDatabase();
                break;
            default:
                console.log('Available commands: init, seed, clear');
                console.log('Usage: npm run db:init|db:seed|db:clear');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

runCommand();