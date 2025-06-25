const analyticsModel = require('../models/analyticsModel.js');
const { generateChart } = require('../services/chartService.js');
const { generateReport } = require('../services/reportService.js');

const analyticsController = {
    // Track user engagement events
    async trackEvent(req, res) {
        try {
            const { userId } = req.user;
            const { eventType, eventData, sessionId } = req.body;
            const ipAddress = req.ip;
            const userAgent = req.get('User-Agent');

            const event = await analyticsModel.trackUserEvent(
                userId, eventType, eventData, sessionId, ipAddress, userAgent
            );

            res.status(201).json({
                success: true,
                message: 'Event tracked successfully',
                data: { eventId: event.id }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to track event',
                error: error.message
            });
        }
    },

    // Get user analytics
    async getUserAnalytics(req, res) {
        try {
            const { userId } = req.user;
            const { days = 30 } = req.query;

            const [userAnalytics, engagementTrends] = await Promise.all([
                analyticsModel.getUserAnalytics(userId),
                analyticsModel.getUserEngagementTrends(userId, parseInt(days))
            ]);

            res.status(200).json({
                success: true,
                data: {
                    summary: userAnalytics,
                    trends: engagementTrends
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user analytics',
                error: error.message
            });
        }
    },

    // Get post analytics
    async getPostAnalytics(req, res) {
        try {
            const { postId } = req.params;
            const analytics = await analyticsModel.getPostAnalytics(postId);

            if (!analytics) {
                return res.status(404).json({
                    success: false,
                    message: 'Post analytics not found'
                });
            }

            res.status(200).json({
                success: true,
                data: analytics
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch post analytics',
                error: error.message
            });
        }
    },

    // Get platform metrics
    async getPlatformMetrics(req, res) {
        try {
            const metrics = await analyticsModel.getPlatformMetrics();

            res.status(200).json({
                success: true,
                data: metrics
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch platform metrics',
                error: error.message
            });
        }
    },

    // Get top performing posts
    async getTopPerformingPosts(req, res) {
        try {
            const { limit = 10 } = req.query;
            const posts = await analyticsModel.getTopPerformingPosts(parseInt(limit));

            res.status(200).json({
                success: true,
                data: posts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch top performing posts',
                error: error.message
            });
        }
    },

    // Generate analytics chart
    async generateChart(req, res) {
        try {
            const { chartType, data, options } = req.body;
            const chartBuffer = await generateChart(chartType, data, options);

            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', 'attachment; filename=chart.png');
            res.send(chartBuffer);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to generate chart',
                error: error.message
            });
        }
    },

    // Get daily analytics
    async getDailyAnalytics(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const analytics = await analyticsModel.getDailyAnalytics(startDate, endDate);

            res.status(200).json({
                success: true,
                data: analytics
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch daily analytics',
                error: error.message
            });
        }
    }
};

module.exports = analyticsController;