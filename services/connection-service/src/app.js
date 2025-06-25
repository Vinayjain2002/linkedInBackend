const express= require('express');
const connectionRoutes= require('./routes/connectionRoutes.js');
const errorHandler= require('./middlewares/errorHandler.js');
const cors= require('cors');
const dotenv= require('dotenv');
const helmet= require('helmet');
const morgan= require('morgan');
// const {createTables}= require('./database/migrate.js');

dotenv.config();
const app= express();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL
}));
app.use(helmet());
app.use(morgan('combined'));

app.use('/api/connections', connectionRoutes);

app.get('/health', async (req, res) => {
    try {
        return res.status(200).json({
            status: 'ok',
            service: 'notification-service',
            timestamp: new Date().toISOString(),
            database: 'connected' // You can add actual database check here if needed
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            service: 'notification-service',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

app.use(errorHandler);

module.exports= app;