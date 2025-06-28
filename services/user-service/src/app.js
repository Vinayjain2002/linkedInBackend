const express= require('express');
const cors= require('cors');
const helmet= require('helmet');
const morgan= require('morgan');

const authRoutes= require('./routes/authRoutes.js');
const userRoutes= require('./routes/userRoutes.js');

const errorHandler= require('./middleware/errorHandler.js');

const app= express();


app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({limit: '10kb'}));
app.use(express.urlencoded({extended: true, limit: '10kb'}));

// Deffining Routes for Health Check
app.get('/health', (req, res)=>{
    const pool= require('./config/database.js');
    return res.status(200).json({
        status: 'ok',
        service: 'user-service',
        timestamp: new Date().toISOString(),
        database: pool._connected ? 'connected' : 'disconnected'
    });
});

// Deffining Error Handler Middleware
app.use(errorHandler);

// Deffining Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// 404 Error Handler
app.use('*', (req,res)=>{
    res.status(404).json({
        error: 'Route Not Found'
    });
});



module.exports= app;
