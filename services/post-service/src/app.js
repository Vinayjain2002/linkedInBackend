const express= require('express');
const cors= require('cors');
const dotenv= require('dotenv');
const helmet= require('helmet');
const morgan= require('morgan');
const {createTables}= require('./database/migrate.js');
const postRoutes= require('./routes/postRoutes.js');
const errorHandler= require('./middlewares/errorHandler.js');

dotenv.config();
await createTables();

const app= express();

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true, limit: '10mb'}));

app.use('/api/posts', postRoutes);
app.use(errorHandler);


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

module.exports= app;