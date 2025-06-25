const pool = require('../config/database');

async function migrate() {
    try {
        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                failed_login_attempts INTEGER DEFAULT 0,
                is_locked BOOLEAN DEFAULT false,
                last_failed_login TIMESTAMP,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                headline VARCHAR(255),
                summary TEXT,
                location VARCHAR(255),
                industry VARCHAR(255),
                profile_picture_url TEXT,
                cover_photo_url TEXT,
                website_url TEXT,
                phone VARCHAR(20),
                date_of_birth DATE,
                is_verified BOOLEAN DEFAULT false,
                email_verified BOOLEAN DEFAULT false,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Create verification_tokens table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS verification_tokens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
