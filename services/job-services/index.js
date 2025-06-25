const dotenv = require('dotenv');
dotenv.config();
const app= require('./src/app.js');
const {connectToDatabase}= require('./src/config/db.js');
const PORT= process.env.PORT || 4005;
const {connectRabbitMQ}= require('./src/config/rabbitmq.js');
const  {connectRedis}= require('./src/config/redis.js');
const {migrate}= require('./src/database/migrate.js');

const startServer= async()=>{
    try{
        await connectToDatabase();
        await connectRabbitMQ();
        await connectRedis();
        migrate();
        app.listen(PORT, ()=>{
            console.log(`Job service is running on port ${PORT}`);
        });
        
    }
    catch(err){
        console.log("Error while Starting the Server", err);
        process.exit(1);
    }
}

const gracefulShutdown= async()=>{
    console.log("Shutting Down Gracefully");
    try{
        channel.close();
        console.log("RabbitMQ Channel closed Successfully");
        process.exit(0);
        
    }
    catch(err){
        console.error("Error during ShutDown", err);
    }
}

startServer();
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);