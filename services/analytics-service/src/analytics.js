const pool = require('../config/database.js');

const analyticsModel = {
    // User Engagement Events
    async trackUserEvent(userId, eventType, eventData, sessionId, ipAddress, userAgent) {
        const result = await pool.query(
            `INSERT INTO user_engagement_events (user_id, event_type, event_data, session_id, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [userId, eventType, JSON.stringify(eventData), sessionId, ipAddress, userAgent]
        );
        return result.rows[0];
    },

    async getUserEvents(userId, limit = 100, offset = 0) {
        const result = await pool.query(
            `SELECT * FROM user_engagement_events 
             WHERE user_id = $1 
             ORDER BY timestamp DESC 
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    },

    // Post Analytics
    async createPostAnalytics(postId, userId) {
        const result = await pool.query(
            `INSERT INTO post_analytics (post_id, user_id) 
             VALUES ($1, $2) 
             ON CONFLICT (post_id) DO NOTHING 
             RETURNING *`,
            [postId, userId]
        );
        return result.rows[0];
    },

    async updatePostMetrics(postId, metrics) {
        const { views, likes, comments, shares, reach, impressions } = metrics;
        const engagementRate = ((likes + comments + shares) / Math.max(views, 1)) * 100;

        const result = await pool.query(
            `UPDATE post_analytics 
             SET views_count = $1, likes_count = $2, comments_count = $3, 
                 shares_count = $4, engagement_rate = $5, reach_count = $6, 
                 impressions_count = $7, updated_at = NOW()
             WHERE post_id = $8 
             RETURNING *`,
            [views, likes, comments, shares, engagementRate, reach, impressions, postId]
        );
        return result.rows[0];
    },

    async getPostAnalytics(postId) {
        const result = await pool.query(
            'SELECT * FROM post_analytics WHERE post_id = $1',
            [postId]
        );
        return result.rows[0];
    },

    // User Analytics Summary
    async createUserAnalytics(userId) {
        const result = await pool.query(
            `INSERT INTO user_analytics_summary (user_id) 
             VALUES ($1) 
             ON CONFLICT (user_id) DO NOTHING 
             RETURNING *`,
            [userId]
        );
        return result.rows[0];
    },

    async updateUserAnalytics(userId, analytics) {
        const result = await pool.query(
            `UPDATE user_analytics_summary 
             SET total_posts = $1, total_views = $2, total_likes = $3, 
                 total_comments = $4, total_shares = $5, total_connections = $6,
                 profile_views = $7, engagement_rate = $8, last_activity = NOW(),
                 updated_at = NOW()
             WHERE user_id = $9 
             RETURNING *`,
            [analytics.totalPosts, analytics.totalViews, analytics.totalLikes,
             analytics.totalComments, analytics.totalShares, analytics.totalConnections,
             analytics.profileViews, analytics.engagementRate, userId]
        );
        return result.rows[0];
    },

    async getUserAnalytics(userId) {
        const result = await pool.query(
            'SELECT * FROM user_analytics_summary WHERE user_id = $1',
            [userId]
        );
        return result.rows[0];
    },

    // Daily Analytics
    async updateDailyAnalytics(date, analytics) {
        const result = await pool.query(
            `INSERT INTO daily_analytics (date, total_users, active_users, total_posts, 
                                        total_views, total_likes, total_comments, total_shares, avg_engagement_rate)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (date) 
             DO UPDATE SET 
                total_users = EXCLUDED.total_users,
                active_users = EXCLUDED.active_users,
                total_posts = EXCLUDED.total_posts,
                total_views = EXCLUDED.total_views,
                total_likes = EXCLUDED.total_likes,
                total_comments = EXCLUDED.total_comments,
                total_shares = EXCLUDED.total_shares,
                avg_engagement_rate = EXCLUDED.avg_engagement_rate,
                created_at = NOW()
             RETURNING *`,
            [date, analytics.totalUsers, analytics.activeUsers, analytics.totalPosts,
             analytics.totalViews, analytics.totalLikes, analytics.totalComments,
             analytics.totalShares, analytics.avgEngagementRate]
        );
        return result.rows[0];
    },

    async getDailyAnalytics(startDate, endDate) {
        const result = await pool.query(
            `SELECT * FROM daily_analytics 
             WHERE date BETWEEN $1 AND $2 
             ORDER BY date DESC`,
            [startDate, endDate]
        );
        return result.rows;
    },

    // Analytics Reports
    async createReport(reportType, reportName, userId, reportData) {
        const result = await pool.query(
            `INSERT INTO analytics_reports (report_type, report_name, user_id, report_data)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [reportType, reportName, userId, JSON.stringify(reportData)]
        );
        return result.rows[0];
    },

    async updateReportStatus(reportId, status, fileUrl = null) {
        const result = await pool.query(
            `UPDATE analytics_reports 
             SET status = $1, file_url = $2, completed_at = NOW()
             WHERE id = $3 
             RETURNING *`,
            [status, fileUrl, reportId]
        );
        return result.rows[0];
    },

    async getReports(userId, limit = 20, offset = 0) {
        const result = await pool.query(
            `SELECT * FROM analytics_reports 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    },

    // Advanced Analytics Queries
    async getTopPerformingPosts(limit = 10) {
        const result = await pool.query(
            `SELECT pa.*, u.first_name, u.last_name 
             FROM post_analytics pa
             JOIN users u ON pa.user_id = u.id
             ORDER BY pa.engagement_rate DESC, pa.views_count DESC
             LIMIT $1`,
            [limit]
        );
        return result.rows;
    },

    async getUserEngagementTrends(userId, days = 30) {
        const result = await pool.query(
            `SELECT DATE(timestamp) as date, 
                    COUNT(*) as total_events,
                    COUNT(CASE WHEN event_type = 'post_view' THEN 1 END) as views,
                    COUNT(CASE WHEN event_type = 'post_like' THEN 1 END) as likes,
                    COUNT(CASE WHEN event_type = 'post_comment' THEN 1 END) as comments
             FROM user_engagement_events
             WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '${days} days'
             GROUP BY DATE(timestamp)
             ORDER BY date DESC`,
            [userId]
        );
        return result.rows;
    },

    async getPlatformMetrics() {
        const result = await pool.query(
            `SELECT 
                COUNT(DISTINCT user_id) as total_users,
                COUNT(DISTINCT CASE WHEN last_activity >= NOW() - INTERVAL '7 days' THEN user_id END) as active_users_7d,
                COUNT(DISTINCT CASE WHEN last_activity >= NOW() - INTERVAL '30 days' THEN user_id END) as active_users_30d,
                SUM(total_posts) as total_posts,
                SUM(total_views) as total_views,
                AVG(engagement_rate) as avg_engagement_rate
             FROM user_analytics_summary`
        );
        return result.rows[0];
    }
};

module.exports = analyticsModel;