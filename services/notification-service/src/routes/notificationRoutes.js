const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController.js');
const auth = require('../middlewares/auth.js');
const { validateNotification, validateSettings } = require('../utils/validationSchema.js');

// Apply auth middleware to all routes
router.use(auth);

// Get user notifications
router.get('/', NotificationController.getNotifications);

// Get unread notifications
router.get('/unread', NotificationController.getUnreadNotifications);

// Mark notification as read
router.patch('/:notificationId/read', NotificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', NotificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', NotificationController.deleteNotification);

// Get notification settings
router.get('/settings', NotificationController.getSettings);

// Update notification settings
router.put('/settings', validateSettings, NotificationController.updateSettings);

// Create notification (for internal use)
router.post('/', validateNotification, NotificationController.createNotification);

module.exports = router;