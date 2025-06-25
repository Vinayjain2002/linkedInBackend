const analyticsModel = require('../models/analyticsModel.js');
const moment = require('moment');

const dashboardController = {
    // Get dashboard overview
    async getDashboardOverview(req, res) {
        try {
            const { userId } = req.user;
            const { period = '30d' } = req.query;

            const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

            const [userAnalytics, engagementTrends, platformMetrics] = await Promise.all([
                analyticsModel.getUserAnalytics(userId),
                analyticsModel.getUserEngagementTrends(userId, days),
                analyticsModel.getPlatformMetrics()
            ]);

            // Calculate growth metrics
            const growthMetrics = calculateGrowthMetrics(engagementTrends);

            res.status(200).json({
                success: true,
                data: {
                    userAnalytics,
                    engagementTrends,
                    platformMetrics,
                    growthMetrics
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard data',
                error: error.message
            });
        }
    },

    // Get real-time metrics
    async getRealTimeMetrics(req, res) {
        try {
            const { userId } = req.user;
            const today = moment().format('YYYY-MM-DD');

            // Get today's events
            const todayEvents = await analyticsModel.getUserEvents(userId, 1000, 0);
            const todayData = todayEvents.filter(event => 
                moment(event.timestamp).format('YYYY-MM-DD') === today
            );

            const realTimeMetrics = {
                todayViews: todayData.filter(e => e.event_type === 'post_view').length,
                todayLikes: todayData.filter(e => e.event_type === 'post_like').length,
                todayComments: todayData.filter(e => e.event_type === 'post_comment').length,
                todayShares: todayData.filter(e => e.event_type === 'post_share').length,
                activeSessions: new Set(todayData.map(e => e.session_id)).size
            };

            res.status(200).json({
                success: true,
                data: realTimeMetrics
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch real-time metrics',
                error: error.message
            });
        }
    },

    // Get insights
    async getInsights(req, res) {
        try {
            const { userId } = req.user;
            const { days = 30 } = req.query;

            const [userAnalytics, engagementTrends] = await Promise.all([
                analyticsModel.getUserAnalytics(userId),
                analyticsModel.getUserEngagementTrends(userId, parseInt(days))
            ]);

            const insights = generateInsights(userAnalytics, engagementTrends);

            res.status(200).json({
                success: true,
                data: insights
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch insights',
                error: error.message
            });
        }
    }
};

// Helper functions
function calculateGrowthMetrics(trends) {
    if (trends.length < 2) return {};

    const recent = trends[0];
    const previous = trends[1];

    return {
        viewsGrowth: calculateGrowth(recent.views, previous.views),
        likesGrowth: calculateGrowth(recent.likes, previous.likes),
        commentsGrowth: calculateGrowth(recent.comments, previous.comments)
    };
}

function calculateGrowth(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

function generateInsights(userAnalytics, trends) {
    const insights = [];

    // Engagement rate insight
    if (userAnalytics.engagement_rate < 2) {
        insights.push({
            type: 'engagement',
            title: 'Low Engagement Rate',
            message: 'Your engagement rate is below average. Try posting more interactive content.',
            priority: 'high'
        });
    }

    // Activity insight
    const recentActivity = trends.slice(0, 7);
    const avgDailyEvents = recentActivity.reduce((sum, day) => sum + day.total_events, 0) / 7;
    
    if (avgDailyEvents < 5) {
        insights.push({
            type: 'activity',
            title: 'Low Activity',
            message: 'Your activity has been low recently. Consider engaging more with your network.',
            priority: 'medium'
        });
    }

    // Growth insight
    if (trends.length >= 2) {
        const recentViews = trends[0].views;
        const previousViews = trends[1].views;
        
        if (recentViews > previousViews * 1.5) {
            insights.push({
                type: 'growth',
                title: 'Growing Views',
                message: 'Great! Your content views have increased significantly.',
                priority: 'low'
            });
        }
    }

    return insights;
}

module.exports = dashboardController;