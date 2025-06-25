const dotenv = require('dotenv');
dotenv.config();
const app= require('./src/app.js');

const PORT= process.env.PORT || 4005;

app.listen(PORT, ()=>{
    console.log(`Job service is running on port ${PORT}`);
});

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

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);