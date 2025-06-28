import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import {createTables} from './database/migrate.js';
import postRoutes from './routes/postRoutes.js';
import {errorHandler} from './middlewares/errorHandler.js';

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
            service: 'post-service',
            timestamp: new Date().toISOString(),
            database: 'connected' // You can add actual database check here if needed
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            service: 'post-service',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

export default app;