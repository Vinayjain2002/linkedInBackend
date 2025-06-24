const redis= require('redis');
const dotenv= require('dotenv');

dotenv.config();

const redisClient= redis.createClient({
    url: process.env.REDIS_URL
});

redisClient.on('connect', ()=>{
    console.log('Redis Client Connected Successfully');
});

redisClient.on('error', (error)=>{
    console.error('Redis Client Error:', error);
});

(async()=>{
    try{
        await redisClient.connect();
        console.log('Redis Client Connected Successfully');
    }
    catch(error){
        console.error('Redis Client Connection Error:', error);
    }
})();
module.exports= redisClient;
