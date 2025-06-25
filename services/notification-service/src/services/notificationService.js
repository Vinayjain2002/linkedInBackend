const NotificationModel = require('../models/notificationModel.js');
const NotificationSettingsModel = require('../models/notificationSettingModel.js');
const EmailService = require('./emailService.js');
const { channel } = require('../config/rabbitmq.js');

class NotificationService {
    
    static async createNotification(notificationData) {
        try {
            const notification = await NotificationModel.create(notificationData);
            const settings = await NotificationSettingsModel.findByUserId(notificationData.user_id);
            
            if (!settings) {
                await NotificationSettingsModel.create(notificationData.user_id);
            }
            await this.sendRealTimeNotification(notification);
            if (settings?.email_enabled) {
                await this.queueEmailNotification(notification);
            }
            if (settings?.push_enabled) {
                await this.queuePushNotification(notification);
            }
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    static async sendRealTimeNotification(notification) {
        try {
            // This would be handled by Socket.io in the main app
            // The notification is already available in the database
            console.log('Real-time notification sent for user:', notification.user_id);
        } catch (error) {
            console.error('Error sending real-time notification:', error);
        }
    }

    static async queueEmailNotification(notification) {
        try {
            console.log('Queuing email notification for user:', notification.user_id);
            console.log('Notification data:', notification);
            await channel.sendToQueue('email_notifications', Buffer.from(JSON.stringify(notification)));
            console.log('Email notification queued for user:', notification.user_id);
        } catch (error) {
            console.error('Error queuing email notification:', error);
        }
    }

    static async queuePushNotification(notification) {
        try {
            console.log('Queuing push notification for user:', notification.user_id);
            console.log('Notification data:', notification);
            await channel.sendToQueue('push_notifications', Buffer.from(JSON.stringify(notification)));
            console.log('Push notification queued for user:', notification.user_id);
        } catch (error) {
            console.error('Error queuing push notification:', error);
        }
    }

    static async processConnectionRequest(fromUserId, toUserId) {
        const notificationData = {
            user_id: toUserId,
            sender_id: fromUserId,
            type: 'connection_request',
            title: 'New Connection Request',
            message: 'You have received a new connection request',
            data: {
                action: 'view_profile',
                profile_id: fromUserId
            }
        };

        return await this.createNotification(notificationData);
    }

    static async processPostLike(postId, postOwnerId, likedByUserId) {
        const notificationData = {
            user_id: postOwnerId,
            sender_id: likedByUserId,
            type: 'post_like',
            title: 'New Like',
            message: 'Someone liked your post',
            data: {
                action: 'view_post',
                post_id: postId
            }
        };

        return await this.createNotification(notificationData);
    }

    static async processPostComment(postId, postOwnerId, commenterId, commentText) {
        const notificationData = {
            user_id: postOwnerId,
            sender_id: commenterId,
            type: 'post_comment',
            title: 'New Comment',
            message: 'Someone commented on your post',
            data: {
                action: 'view_post',
                post_id: postId,
                comment_preview: commentText.substring(0, 100)
            }
        };

        return await this.createNotification(notificationData);
    }

    static async processMention(userId, mentionedByUserId, postId, context) {
        const notificationData = {
            user_id: userId,
            sender_id: mentionedByUserId,
            type: 'mention',
            title: 'You were mentioned',
            message: 'Someone mentioned you in a post',
            data: {
                action: 'view_post',
                post_id: postId,
                context: context
            }
        };

        return await this.createNotification(notificationData);
    }
}

module.exports = NotificationService;