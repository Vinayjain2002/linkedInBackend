const app= require('./src/app.js');
const {pool, connectDatabase}= require('./src/config/db.js');
const {connectRabbitMQ}= require('./src/config/rabbitmq.js');
const {connectRedis}= require('./src/config/redis.js');
const PORT= process.env.PORT || 3002;


const startServer= async()=>{
    try{
        await connectDatabase();
        await connectRedis();
        await connectRabbitMQ();

        app.listen(PORT, ()=>{
            console.log(`Post Service running on the Port ${PORT}`)
        });
    }
    catch(err){
        console.log("Error while Starting the Server", err);
        process.exit(1);
    }
}

const gracefulShutdown= async ()=>{
    console.log('Shutting down gracefully...');
    try{
        console.log("Postgree Pool disconnected");
        console.log("RabbitMQ channel closed");
        process.exit(0);
    }catch(error){
        console.error('Error during shutdown:', error);
    }
}

startServer();

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
