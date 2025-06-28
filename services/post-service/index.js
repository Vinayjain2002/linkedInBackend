import app from './src/app.js';
import {pool, connectDatabase} from './src/config/db.js';
import {connectRabbitMQ} from'./src/config/rabbitmq.js';
import {connectRedis} from'./src/config/redis.js';
const  PORT= process.env.PORT || 3002;


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
