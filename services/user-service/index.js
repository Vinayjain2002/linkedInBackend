const dotenv= require('dotenv');
const migrate= require('./src/database/migrate.js');
const app= require('./src/app.js');
const {pool, connectDatabase}= require('./src/config/database.js');
const redisClient= require('./src/config/redis.js');

const PORT= process.env.PORT || 3001;

// Graceful Shutdown

// Graceful Shutdown
const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    try {
        // Stop accepting new connections
        server.close(async (err) => {
            if (err) {
                console.error('Error closing server:', err);
                process.exit(1);
            }
            await pool.end();
            console.log("PostgreSQL Pool disconnected");
            await redisClient.quit();
            console.log("Redis Client disconnected");
            await closeConnection();
            console.log("RabbitMQ Connection closed");
            process.exit(0);
        });
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

const startServer= async()=>{
    try{
        connectDatabase();
      const server=  app.listen(PORT, ()=>{
            console.log(`User Service is running on the Port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV} || 'development'`);
        });
    }
    catch(err){

    }
}

startServer();