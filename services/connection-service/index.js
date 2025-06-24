const app= require('./src/app.js');
const PORT= process.env.PORT || 3004;
const sequelize= require('./src/config/db.js');

sequelize.sync().then(()=>{
    console.log('Database & tables created!');
}).catch((err)=>{
    console.error('Error syncing database:', err);
});
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

app.listen(PORT, ()=>{
    console.log(`Connection Service running on port ${PORT}`);
});

