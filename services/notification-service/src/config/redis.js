const redis= require('redis');
const dotenv= require('dotenv');
dotenv.config();

const client= redis.createClient({
    url: process.env.REDIS_URL
});

client.on('ready', ()=>{
    console.log('Redis Client Ready');
});

client.on('error', (error)=>{
    console.error('Redis Client Error:', error);
});

client.on('end', ()=>{
    console.log('Redis Client Disconnected')
});

async function connectRedis(){
    if(client.isOpen){
        console.log("Redis Client is already connected");
    }
    try{
        await client.connect();
        console.log('Connected to Redis');
        return client;
    }
    catch(err){
        console.error('Error connecting to Redis:', err);
        throw err;
    }
}


module.exports= {client, connectRedis};