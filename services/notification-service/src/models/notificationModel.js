const { pool } = require('../config/database.js');

class NotificationModel {
    static async create(notificationData) {
        const { user_id, sender_id, type, title, message, data } = notificationData;
        
        const query = `
            INSERT INTO notifications (user_id, sender_id, type, title, message, data)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const values = [user_id, sender_id, type, title, message, JSON.stringify(data)];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async findByUserId(userId, limit = 20, offset = 0) {
        const query = `
            SELECT * FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3
        `;
        
        const result = await pool.query(query, [userId, limit, offset]);
        return result.rows;
    }

    static async findUnreadByUserId(userId) {
        const query = `
            SELECT * FROM notifications 
            WHERE user_id = $1 AND is_read = FALSE 
            ORDER BY created_at DESC
        `;
        
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    static async markAsRead(notificationId, userId) {
        const query = `
            UPDATE notifications 
            SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `;
        
        const result = await pool.query(query, [notificationId, userId]);
        return result.rows[0];
    }

    static async markAllAsRead(userId) {
        const query = `
            UPDATE notifications 
            SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND is_read = FALSE
            RETURNING *
        `;
        
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    static async deleteNotification(notificationId, userId) {
        const query = `
            DELETE FROM notifications 
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `;
        
        const result = await pool.query(query, [notificationId, userId]);
        return result.rows[0];
    }

    static async getUnreadCount(userId) {
        const query = `
            SELECT COUNT(*) as count 
            FROM notifications 
            WHERE user_id = $1 AND is_read = FALSE
        `;
        
        const result = await pool.query(query, [userId]);
        return parseInt(result.rows[0].count);
    }
}

module.exports = NotificationModel;