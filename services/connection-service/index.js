const app= require('./src/app.js');
const PORT= process.env.PORT || 3004;
const {connectDatabase}= require('./src/config/db.js');

const startServer= async()=>{
    try{
        await connectDatabase();

        app.listen(PORT, ()=>{
            console.log(`Connection Service running on port ${PORT}`);
        });
        
    }catch(err){
        console.error('Error starting server:', err);
        process.exit(1);
    }
}

const gracefulShutdown= async ()=>{
    console.log('Shutting down gracefully...');
    try{
        process.exit(0);
    }catch(error){
        console.error('Error during shutdown:', error);
    }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startServer();