const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController.js');

// Example: Track event
router.post('/track', analyticsController.trackEvent);

// Example: Get user analytics
router.get('/user', analyticsController.getUserAnalytics);

// Example: Get post analytics
router.get('/post/:postId', analyticsController.getPostAnalytics);

// Example: Get platform metrics
router.get('/platform', analyticsController.getPlatformMetrics);

// Example: Get top posts
router.get('/top-posts', analyticsController.getTopPerformingPosts);

// Example: Get daily analytics
router.get('/daily', analyticsController.getDailyAnalytics);

module.exports = router;