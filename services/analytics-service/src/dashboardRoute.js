const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController.js');

// Dashboard overview
router.get('/overview', dashboardController.getDashboardOverview);

// Real-time metrics
router.get('/realtime', dashboardController.getRealTimeMetrics);

// Insights
router.get('/insights', dashboardController.getInsights);

module.exports = router;