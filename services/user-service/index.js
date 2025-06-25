const dotenv= require('dotenv');
const migrate= require('./src/database/migrate.js');
const app= require('./src/app.js');
const pool= require('./src/config/database.js');
const redisClient= require('./src/config/redis.js');

const PORT= process.env.PORT || 3001;

// Graceful Shutdown
const gracefulShutdown= async ()=>{
    console.log('Shutting down gracefully...');
    try{
        console.log("Postgree Pool disconnected");
        await redisClient.quit();
        console.log("Redis Client disconnected");
        process.exit(0);
    }catch(error){
        console.error('Error during shutdown:', error);
    }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

app.listen(PORT, ()=>{
    console.log(`User Service is running on the Port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV} || 'development'`);
});