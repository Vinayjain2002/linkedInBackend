const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController.js');

// Create a report
router.post('/', reportController.createReport);

// Get all reports for user
router.get('/', reportController.getUserReports);

// Get a specific report
router.get('/:reportId', reportController.getReport);

// Download a report
router.get('/:reportId/download', reportController.downloadReport);

module.exports = router;