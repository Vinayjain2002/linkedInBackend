const analyticsModel = require('../models/analyticsModel.js');
const { generateReport } = require('../services/reportService.js');

const reportController = {
    // Create a new report
    async createReport(req, res) {
        try {
            const { userId } = req.user;
            const { reportType, reportName, reportData } = req.body;

            const report = await analyticsModel.createReport(
                reportType, reportName, userId, reportData
            );

            // Generate report asynchronously
            generateReport(report.id, reportType, reportData);

            res.status(201).json({
                success: true,
                message: 'Report generation started',
                data: { reportId: report.id }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to create report',
                error: error.message
            });
        }
    },

    // Get user reports
    async getUserReports(req, res) {
        try {
            const { userId } = req.user;
            const { limit = 20, offset = 0 } = req.query;

            const reports = await analyticsModel.getReports(
                userId, parseInt(limit), parseInt(offset)
            );

            res.status(200).json({
                success: true,
                data: reports
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch reports',
                error: error.message
            });
        }
    },

    // Get report by ID
    async getReport(req, res) {
        try {
            const { reportId } = req.params;
            const { userId } = req.user;

            const reports = await analyticsModel.getReports(userId);
            const report = reports.find(r => r.id === parseInt(reportId));

            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: 'Report not found'
                });
            }

            res.status(200).json({
                success: true,
                data: report
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch report',
                error: error.message
            });
        }
    },

    // Download report
    async downloadReport(req, res) {
        try {
            const { reportId } = req.params;
            const { userId } = req.user;

            const reports = await analyticsModel.getReports(userId);
            const report = reports.find(r => r.id === parseInt(reportId));

            if (!report || report.status !== 'completed') {
                return res.status(404).json({
                    success: false,
                    message: 'Report not found or not ready'
                });
            }

            // Redirect to file download
            res.redirect(report.file_url);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to download report',
                error: error.message
            });
        }
    }
};

module.exports = reportController;