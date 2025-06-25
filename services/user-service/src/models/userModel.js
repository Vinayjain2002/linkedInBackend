const pool= require('../config/database.js');

const userModel= {
    async createUser(email, passwordHash, first_name, last_name, headline, location, industry, phone) {
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, headline, location, industry, phone)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, first_name, last_name, is_active`,
            [email, passwordHash, first_name, last_name, headline, location, industry, phone]
        );
        return result.rows[0];
    },

    async findUserByEmail(email) {
        const result = await pool.query(
            'SELECT id, email, password_hash, first_name, last_name, is_active FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    },

    async findUserById(id) {
        const result = await pool.query(
            `SELECT id, email, first_name, last_name, headline, summary, location, industry,
                    profile_picture_url, cover_photo_url, website_url, phone, date_of_birth,
                    is_verified, email_verified, created_at, updated_at, is_active
             FROM users WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    },

    async updateProfile(userId, updateFields, updateValues) {
        const query = `
            UPDATE users
            SET ${updateFields.join(', ')}, updated_at = NOW()
            WHERE id = $${updateValues.length + 1}
            RETURNING *
        `;
        const result = await pool.query(query, [...updateValues, userId]);
        return result.rows[0];
    },

    async updateProfilePicture(userId, pictureUrl) {
        const result = await pool.query(
            'UPDATE users SET profile_picture_url = $1, updated_at = NOW() WHERE id = $2 RETURNING profile_picture_url',
            [pictureUrl, userId]
        );
        return result.rows[0].profile_picture_url;
    },

    async softDeleteAccount(userId) {
        await pool.query(
            'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
            [userId]
        );
    },

    async storeVerificationToken(userId, token, type, expiresAt) {
        await pool.query(
            'INSERT INTO verification_tokens (user_id, token, type, expires_at) VALUES ($1, $2, $3, $4)',
            [userId, token, type, expiresAt]
        );
    },

    async findVerificationToken(token, type) {
        const result = await pool.query(
            'SELECT user_id FROM verification_tokens WHERE token = $1 AND type = $2 AND expires_at > NOW()',
            [token, type]
        );
        return result.rows[0];
    },

    async deleteVerificationToken(token) {
        await pool.query('DELETE FROM verification_tokens WHERE token = $1', [token]);
    },

    async updatePassword(userId, passwordHash) {
        await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [passwordHash, userId]
        );
    },

    async searchUsers(searchTerm, limit, offset) {
        const result = await pool.query(
            `SELECT id, first_name, last_name, headline, location, industry, profile_picture_url
             FROM users
             WHERE is_active = true
             AND (first_name ILIKE $1 OR last_name ILIKE $1 OR headline ILIKE $1 OR industry ILIKE $1)
             ORDER BY first_name, last_name
             LIMIT $2 OFFSET $3`,
            [searchTerm, limit, offset]
        );
        return result.rows;
    },
    async recordFailedLogin(email){
        const user = await pool.query('SELECT failed_login_attempts FROM users WHERE email = $1', [email]);
        if (!user.rows[0]) return;
        const attempts = user.rows[0].failed_login_attempts + 1;
        let isBlocked = false;
        if (attempts >= 5) isBlocked = true;
        await pool.query(
            'UPDATE users SET failed_login_attempts = $1, is_blocked = $2, last_failed_login = NOW() WHERE email = $3',
            [attempts, isBlocked, email]
        );
    },
    async  resetFailedLogin(email) {
        if(!email){
            return;
        }
        await pool.query(
            'UPDATE users SET failed_login_attempts = 0, is_blocked = false WHERE email = $1',
            [email]
        );
    },
    async isUserBlocked(email) {
        const result = await pool.query('SELECT is_blocked FROM users WHERE email = $1', [email]);
        return result.rows[0]?.is_blocked;
    }
}

module.exports= userModel;