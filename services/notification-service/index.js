const app= require('./src/app.js');
const {connectDatabase}= require('./src/config/database.js');
const {connectRedis} = require('./src/config/redis.js');
const {connectRabbitMQ} = require('./src/config/rabbitmq.js');

const PORT= process.env.PORT || 3004;

const startServer= async()=>{
    try{
        await connectDatabase();
        await connectRedis();
        await connectRabbitMQ();

        app.listen(PORT, ()=>{
            console.log(`Notification Service running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });
    }
    catch(err){
        console.error('Error starting server:', err);
        process.exit(1);
    }
}

startServer();

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});