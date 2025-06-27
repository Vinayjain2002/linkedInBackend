
const UserModel = require('../models/userModel');
const redisClient = require('../config/redis');
const UserEventService = require('./userEventService');

const userService = {
    async getUserProfile(userId) {
        const cachedUser = await redisClient.get(`user:${userId}`);
        if (cachedUser) {
            return JSON.parse(cachedUser);
        }

        const user = await UserModel.findUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        await redisClient.setEx(`user:${userId}`, 3600, JSON.stringify(user));
        return user;
    },

    async updateExistingProfile(userId, updateData) {
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;

        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                updateFields.push(`${key} = $${paramCount}`);
                updateValues.push(updateData[key]);
                paramCount++;
            }
        });

        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }

        const user = await UserModel.updateProfile(userId, updateFields, updateValues);
        await UserEventService.publishUserProfileUpdate({
            id: userId,
            email: user.email,
            updatedFields: Object.keys(updateData)
        });
        if (!user) {
            throw new Error('User not found');
        }

        await redisClient.setEx(`user:${userId}`, 3600, JSON.stringify(user));
        return user;
    },

    async uploadUserProfilePicture(userId) {
      const pictureUrl = `https://example.com/profile-pictures/${userId}-${Date.now()}.jpg`;

        const updatedPictureUrl = await UserModel.updateProfilePicture(userId, pictureUrl);
        await redisClient.del(`user:${userId}`); // Clear cache for updated profile
        return updatedPictureUrl;
    },

    async deleteUserAccount(userId) {
        await UserModel.softDeleteAccount(userId);
        await UserEventService.publishAdminAlert({
            type: 'USER_DEACTIVATION',
                message: `User account deactivated: ${user.email}`,
                severity: 'WARNING',
                userId: userId
        });
        await redisClient.del(`user:${userId}`); // Clear cache
    },

    async searchUsers(query, page, limit) {
        if (!query) {
            throw new Error('Search query is required');
        }

        const offset = (page - 1) * limit;
        const searchTerm = `%${query}%`;

        const users = await UserModel.searchUsers(searchTerm, limit, offset);

        return {
            users,
            page: parseInt(page),
            limit: parseInt(limit),
            total: users.length // Note: For actual total, you'd need a separate count query
        };
    },

    async getUserById(userId) {
        const cachedUser = await redisClient.get(`user:${userId}`);
        if (cachedUser) {
            return JSON.parse(cachedUser);
        }

        const user = await UserModel.findUserById(userId);
        if (!user || !user.is_active) {
            throw new Error('User not found or inactive');
        }

        // Only cache public-facing user data
        const publicUser = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            headline: user.headline,
            location: user.location,
            industry: user.industry,
            profile_picture_url: user.profile_picture_url,
            is_verified: user.is_verified,
            created_at: user.created_at
        };

        await redisClient.setEx(`user:${userId}`, 3600, JSON.stringify(publicUser));
        return publicUser;
    }
};

module.exports = userService;