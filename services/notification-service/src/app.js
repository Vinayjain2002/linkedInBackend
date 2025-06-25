const express= require('express');
const cors= require('cors');
const helmet= require('helmet');
const morgan= require('morgan');
const http= require('http');
const socket= require('socket.io');

const notificationRouter= require('./routes/notificationRoutes.js');
const errorHandler= require('./middlewares/errorHandler.js');

const app= express();
const server= http.createServer(app);
const io= socket(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.use(cors({
    origin: process.env.FRONTEND_URL,
}));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// app.use((req, res, next) => {
//     req.io = io;
//     next();
// });

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

app.use('/api/v1/notifications', notificationRouter);

app.use(errorHandler);


io.on('connection', (socket)=>{
    console.log('A user connected', socket.id);
    socket.on('join', (userId)=>{
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined`);
    });
   
    socket.on('disconnect', ()=>{
        console.log('A user disconnected');
    });
});


module.exports= server;