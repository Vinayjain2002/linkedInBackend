const app = require('./src/app.js');
const { createTables } = require('./src/database/migrate.js');
const { startAnalyticsWorker } = require('./src/workers/analyticsWorker.js');

const PORT = process.env.ANALYTICS_SERVICE_PORT || 3006;

async function startServer() {
    try {
        // Initialize database tables
        await createTables();
        console.log('✅ Database tables created successfully');

        // Start analytics worker
        await startAnalyticsWorker();
        console.log('✅ Analytics worker started successfully');

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Analytics Service running on port ${PORT}`);
            console.log(`�� Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start Analytics Service:', error);
        process.exit(1);
    }
}

startServer();