const {pool}= require('../config/database.js');

const createTables= async ()=>{
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                sender_id INTEGER,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                data JSONB,
                is_read BOOLEAN DEFAULT FALSE,
                is_email_sent BOOLEAN DEFAULT FALSE,
                is_push_sent BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS notification_settings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER UNIQUE NOT NULL,
                email_enabled BOOLEAN DEFAULT TRUE,
                push_enabled BOOLEAN DEFAULT TRUE,
                in_app_enabled BOOLEAN DEFAULT TRUE,
                connection_requests BOOLEAN DEFAULT TRUE,
                new_messages BOOLEAN DEFAULT TRUE,
                post_likes BOOLEAN DEFAULT TRUE,
                post_comments BOOLEAN DEFAULT TRUE,
                mentions BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create indexes
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
            CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
            CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
            CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
        `);
    }
    catch(err){
        console.error('Error creating tables:', err);
        throw err;
    }
};

const runMigrations = async () => {
    try {
        await createTables();
        console.log('Migrations completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    runMigrations();
}

module.exports = { createTables };