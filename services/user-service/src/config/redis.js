const redis= require('redis');
const dotenv= require('dotenv');

dotenv.config();

const redisClient= redis.createClient({
    url: process.env.REDIS_URL
});

redisClient.on('connect', ()=>{
    console.log('Redis Client Connected Successfully');
});

redisClient.on('ready', ()=>{
    console.log('Redis Client Ready');
});

redisClient.on('error', (error)=>{
    console.error('Redis Client Error:', error);
});

redisClient.on('end', ()=>{
    console.log('Redis Client Disconnected')
})

async function connectRedis(){
    if(redisClient.isOpen){
        console.log("Redis Client is already connected");
    }
    try{
        await redisClient.connect();

        console.log("Redis Client Connected Successfully");
        return redisClient;
    }
    catch(err){
        console.error("Redis Client Connection Error", err);
        throw err;
    }
}

connectRedis();

module.exports= redisClient;
