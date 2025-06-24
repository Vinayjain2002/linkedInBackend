const app= require('./src/app.js');
const PORT= process.env.PORT || 3003;
const sequelize= require('./config/db.js');


// Graceful Shutdown
const gracefulShutdown= async ()=>{
    console.log('Shutting down gracefully...');
    try{
        await pool.end();
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


Sequelize.sync().then(()=>{
    console.log('Database & tables created!');
});

app.listen(PORT, ()=>{
    console.log(`User Service is running on the Port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV} || 'development'`);
});