const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs').promises;
const path = require('path');
const analyticsModel = require('../models/analyticsModel.js');

const reportService = {
    async generateReport(reportId, reportType, reportData) {
        try {
            let reportContent;
            let fileName;

            switch (reportType) {
                case 'user_engagement':
                    reportContent = await this.generateUserEngagementReport(reportData);
                    fileName = `user_engagement_${Date.now()}.csv`;
                    break;
                case 'post_performance':
                    reportContent = await this.generatePostPerformanceReport(reportData);
                    fileName = `post_performance_${Date.now()}.csv`;
                    break;
                case 'platform_analytics':
                    reportContent = await this.generatePlatformAnalyticsReport(reportData);
                    fileName = `platform_analytics_${Date.now()}.csv`;
                    break;
                default:
                    throw new Error('Unknown report type');
            }

            // Save report file
            const reportsDir = path.join(__dirname, '../../reports');
            await fs.mkdir(reportsDir, { recursive: true });
            
            const filePath = path.join(reportsDir, fileName);
            await fs.writeFile(filePath, reportContent);

            // Update report status
            const fileUrl = `/reports/${fileName}`;
            await analyticsModel.updateReportStatus(reportId, 'completed', fileUrl);

        } catch (error) {
            console.error('Error generating report:', error);
            await analyticsModel.updateReportStatus(reportId, 'failed');
        }
    },

    async generateUserEngagementReport(data) {
        const { userId, startDate, endDate } = data;
        
        const events = await analyticsModel.getUserEvents(userId, 10000, 0);
        const filteredEvents = events.filter(event => 
            event.timestamp >= startDate && event.timestamp <= endDate
        );

        const csvWriter = createCsvWriter({
            path: 'temp_report.csv',
            header: [
                { id: 'timestamp', title: 'Timestamp' },
                { id: 'event_type', title: 'Event Type' },
                { id: 'session_id', title: 'Session ID' },
                { id: 'ip_address', title: 'IP Address' }
            ]
        });

        await csvWriter.writeRecords(filteredEvents);
        
        const content = await fs.readFile('temp_report.csv', 'utf-8');
        await fs.unlink('temp_report.csv');
        
        return content;
    },

    async generatePostPerformanceReport(data) {
        const { userId, startDate, endDate } = data;
        
        // This would typically fetch post analytics data
        // For now, returning a sample report
        const csvWriter = createCsvWriter({
            path: 'temp_report.csv',
            header: [
                { id: 'post_id', title: 'Post ID' },
                { id: 'views', title: 'Views' },
                { id: 'likes', title: 'Likes' },
                { id: 'comments', title: 'Comments' },
                { id: 'shares', title: 'Shares' },
                { id: 'engagement_rate', title: 'Engagement Rate' }
            ]
        });

        const sampleData = [
            { post_id: 1, views: 100, likes: 10, comments: 5, shares: 2, engagement_rate: 17 },
            { post_id: 2, views: 200, likes: 25, comments: 8, shares: 5, engagement_rate: 19 }
        ];

        await csvWriter.writeRecords(sampleData);
        
        const content = await fs.readFile('temp_report.csv', 'utf-8');
        await fs.unlink('temp_report.csv');
        
        return content;
    },

    async generatePlatformAnalyticsReport(data) {
        const { startDate, endDate } = data;
        
        const dailyAnalytics = await analyticsModel.getDailyAnalytics(startDate, endDate);
        const platformMetrics = await analyticsModel.getPlatformMetrics();

        const csvWriter = createCsvWriter({
            path: 'temp_report.csv',
            header: [
                { id: 'date', title: 'Date' },
                { id: 'total_users', title: 'Total Users' },
                { id: 'active_users', title: 'Active Users' },
                { id: 'total_posts', title: 'Total Posts' },
                { id: 'total_views', title: 'Total Views' },
                { id: 'avg_engagement_rate', title: 'Avg Engagement Rate' }
            ]
        });

        await csvWriter.writeRecords(dailyAnalytics);
        
        const content = await fs.readFile('temp_report.csv', 'utf-8');
        await fs.unlink('temp_report.csv');
        
        return content;
    }
};

module.exports = reportService;