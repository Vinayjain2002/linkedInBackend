const pool = require('../config/database.js');

async function createTables() {
    try {
        // User Engagement Analytics
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_engagement_events (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                event_type VARCHAR(50) NOT NULL,
                event_data JSONB,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_id VARCHAR(100),
                ip_address INET,
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Post Analytics
        await pool.query(`
            CREATE TABLE IF NOT EXISTS post_analytics (
                id SERIAL PRIMARY KEY,
                post_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                views_count INTEGER DEFAULT 0,
                likes_count INTEGER DEFAULT 0,
                comments_count INTEGER DEFAULT 0,
                shares_count INTEGER DEFAULT 0,
                engagement_rate DECIMAL(5,2) DEFAULT 0,
                reach_count INTEGER DEFAULT 0,
                impressions_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // User Analytics Summary
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_analytics_summary (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                total_posts INTEGER DEFAULT 0,
                total_views INTEGER DEFAULT 0,
                total_likes INTEGER DEFAULT 0,
                total_comments INTEGER DEFAULT 0,
                total_shares INTEGER DEFAULT 0,
                total_connections INTEGER DEFAULT 0,
                profile_views INTEGER DEFAULT 0,
                engagement_rate DECIMAL(5,2) DEFAULT 0,
                last_activity TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Daily Analytics
        await pool.query(`
            CREATE TABLE IF NOT EXISTS daily_analytics (
                id SERIAL PRIMARY KEY,
                date DATE NOT NULL,
                total_users INTEGER DEFAULT 0,
                active_users INTEGER DEFAULT 0,
                total_posts INTEGER DEFAULT 0,
                total_views INTEGER DEFAULT 0,
                total_likes INTEGER DEFAULT 0,
                total_comments INTEGER DEFAULT 0,
                total_shares INTEGER DEFAULT 0,
                avg_engagement_rate DECIMAL(5,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(date)
            )
        `);

        // Analytics Reports
        await pool.query(`
            CREATE TABLE IF NOT EXISTS analytics_reports (
                id SERIAL PRIMARY KEY,
                report_type VARCHAR(50) NOT NULL,
                report_name VARCHAR(100) NOT NULL,
                user_id INTEGER,
                report_data JSONB,
                status VARCHAR(20) DEFAULT 'pending',
                file_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            )
        `);

        // Create indexes for better performance
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement_events(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_engagement_timestamp ON user_engagement_events(timestamp);
            CREATE INDEX IF NOT EXISTS idx_post_analytics_post_id ON post_analytics(post_id);
            CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics_summary(user_id);
            CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date);
        `);

        console.log('✅ Analytics database tables created successfully');
    } catch (error) {
        console.error('❌ Error creating analytics tables:', error);
        throw error;
    }
}

module.exports = { createTables };