const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');

dotenv.config();

const analyticsRoutes = require('./routes/analyticsRoutes.js');
const reportRoutes = require('./routes/reportRoutes.js');
const dashboardRoutes = require('./routes/dashboardRoutes.js');
const errorHandler = require('./middlewares/errorHandler.js');
const rateLimiter = require('./middlewares/rateLimiter.js');

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', async (req, res) => {
    try {
        const pool = require('./config/database.js');
        const redis = require('./config/redis.js');
        
        return res.status(200).json({
            status: 'ok',
            service: 'analytics-service',
            timestamp: new Date().toISOString(),
            database: pool._connected ? 'connected' : 'disconnected',
            redis: redis.status === 'ready' ? 'connected' : 'disconnected'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            service: 'analytics-service',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Routes
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route Not Found',
        service: 'analytics-service'
    });
});

module.exports = app;