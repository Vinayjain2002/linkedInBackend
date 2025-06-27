const { connectDatabase } = require('../post-service/src/config/db.js');
const { connectRabbitMQ } = require('../post-service/src/config/rabbitmq.js');
const { connectRedis } = require('../post-service/src/config/redis.js');
const app= require('./src/app.js');
const PORT= process.env.PORT || 3010;
const migrate= require('./src/database/migrate.js');


// Graceful Shutdown
const gracefulShutdown= async ()=>{
    console.log('Shutting down gracefully...');
    try{
        await pool.end();
        console.log("Postgree Pool disconnected");
        await redisClient.quit();
        console.log("Redis Client disconnected");
    }catch(error){
        console.error('Error during shutdown:', error);
    }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

const startServer= async()=>{
    try{
        await connectDatabase();
        await connectRabbitMQ();
        await connectRedis();
    }
    catch(err){
        console.log("Error while Starting the Server", err);
        process.exit(1);
    }
}
startServer();