const app= require('./src/app.js');
const {pool, connectDatabase}= require('./src/config/db.js');
const {connectRabbitMQ}= require('./src/config/rabbitmq.js');
const {connectRedis}= require('./src/config/redis.js');
const PORT= process.env.PORT || 3002;

connectDatabase();
connectRedis();
connectRabbitMQ().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`Post Service running on port ${PORT}`);
    });
}).catch((err)=>{
    console.error('Error connecting to RabbitMQ:', err);
    process.exit(1);
});

const gracefulShutdown= async ()=>{
    console.log('Shutting down gracefully...');
    try{
        await pool.end();
        console.log("Postgree Pool disconnected");
        await channel.close();
        console.log("RabbitMQ channel closed");
        process.exit(0);
    }catch(error){
        console.error('Error during shutdown:', error);
    }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
