const NotificationModel = require('../models/notificationModel.js');
const NotificationSettingsModel = require('../models/notificationSettingModel.js');
const NotificationService = require('../services/notificationService.js');

class NotificationController {
    static async getNotifications(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            const notifications = await NotificationModel.findByUserId(userId, limit, offset);
            const unreadCount = await NotificationModel.getUnreadCount(userId);

            res.status(200).json({
                success: true,
                data: {
                    notifications,
                    unreadCount,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: notifications.length
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch notifications'
            });
        }
    }

    static async getUnreadNotifications(req, res) {
        try {
            const userId = req.user.id;
            const notifications = await NotificationModel.findUnreadByUserId(userId);

            res.status(200).json({
                success: true,
                data: notifications
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch unread notifications'
            });
        }
    }

    static async markAsRead(req, res) {
        try {
            const userId = req.user.id;
            const { notificationId } = req.params;

            const notification = await NotificationModel.markAsRead(notificationId, userId);
            
            if (!notification) {
                return res.status(404).json({
                    success: false,
                    error: 'Notification not found'
                });
            }

            res.status(200).json({
                success: true,
                data: notification
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to mark notification as read'
            });
        }
    }

    static async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;
            const notifications = await NotificationModel.markAllAsRead(userId);

            res.status(200).json({
                success: true,
                data: {
                    message: 'All notifications marked as read',
                    count: notifications.length
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to mark all notifications as read'
            });
        }
    }

    static async deleteNotification(req, res) {
        try {
            const userId = req.user.id;
            const { notificationId } = req.params;

            const notification = await NotificationModel.deleteNotification(notificationId, userId);
            
            if (!notification) {
                return res.status(404).json({
                    success: false,
                    error: 'Notification not found'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    message: 'Notification deleted successfully'
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to delete notification'
            });
        }
    }

    static async getSettings(req, res) {
        try {
            const userId = req.user.id;
            let settings = await NotificationSettingsModel.findByUserId(userId);

            if (!settings) {
                settings = await NotificationSettingsModel.create(userId);
            }

            res.status(200).json({
                success: true,
                data: settings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch notification settings'
            });
        }
    }

    static async updateSettings(req, res) {
        try {
            const userId = req.user.id;
            const settings = req.body;

            const updatedSettings = await NotificationSettingsModel.update(userId, settings);

            res.status(200).json({
                success: true,
                data: updatedSettings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to update notification settings'
            });
        }
    }

    static async createNotification(req, res) {
        try {
            const notificationData = req.body;
            const notification = await NotificationService.createNotification(notificationData);

            res.status(201).json({
                success: true,
                data: notification
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to create notification'
            });
        }
    }
}

module.exports = NotificationController;