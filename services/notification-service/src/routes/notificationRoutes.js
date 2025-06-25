const express = require('express');
const router = express.Router();
const NotificationController = require("../controller/notificationController.js");
const auth = require('../middlewares/auth.js');
const { validateNotification, validateSettings } = require('../utils/validationSchema.js');


router.get('/', auth, NotificationController.getNotifications);
router.get('/unread', auth, NotificationController.getUnreadNotifications);
router.get('/settings', auth, NotificationController.getSettings);
router.put('/settings', auth, validateSettings, NotificationController.updateSettings);
router.patch('/read-all', auth, NotificationController.markAllAsRead);
router.post('/', auth, validateNotification, NotificationController.createNotification);
router.patch('/:notificationId/read', auth, NotificationController.markAsRead);
router.delete('/:notificationId', auth, NotificationController.deleteNotification);

module.exports = router;