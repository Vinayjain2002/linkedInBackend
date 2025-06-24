const { pool } = require('../config/database.js');

class NotificationSettingsModel {
    static async create(userId) {
        const query = `
            INSERT INTO notification_settings (user_id)
            VALUES ($1)
            RETURNING *
        `;
        
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    static async findByUserId(userId) {
        const query = `
            SELECT * FROM notification_settings 
            WHERE user_id = $1
        `;
        
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    static async update(userId, settings) {
        const query = `
            UPDATE notification_settings 
            SET 
                email_enabled = $2,
                push_enabled = $3,
                in_app_enabled = $4,
                connection_requests = $5,
                new_messages = $6,
                post_likes = $7,
                post_comments = $8,
                mentions = $9,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1
            RETURNING *
        `;
        
        const values = [
            userId,
            settings.email_enabled,
            settings.push_enabled,
            settings.in_app_enabled,
            settings.connection_requests,
            settings.new_messages,
            settings.post_likes,
            settings.post_comments,
            settings.mentions
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    }
}

module.exports = NotificationSettingsModel;