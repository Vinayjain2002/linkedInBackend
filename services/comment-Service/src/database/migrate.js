const sequelize = require('../config/db.js');

async function migrate() {
    try {
        // Create comments table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS "Comments" (
                id SERIAL PRIMARY KEY,
                "postId" INTEGER NOT NULL,
                "userId" INTEGER NOT NULL,
                content TEXT NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
            );
        `);

        console.log('Comment table migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await sequelize.close();
    }
}

migrate();
