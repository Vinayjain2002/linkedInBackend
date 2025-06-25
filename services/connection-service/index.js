const app= require('./src/app.js');
const PORT= process.env.PORT || 3004;



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
    console.log(`Connection Service running on port ${PORT}`);
});

