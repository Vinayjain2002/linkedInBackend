import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();
console.log("the url of the Redis is defined as the ", process.env.REDIS_URL);

export const client= redis.createClient({
    url: process.env.REDIS_URL
});

export  const connectRedis= async()=>{
    if(client.isOpen){
        console.log("Redis Client is already Connected");
    }
    try{
        await client.connect();
        console.log("Connected to Redis");
        return client;
    }   
    catch(err){
        console.error("Error connecting to Redis", err);
        throw err;
    }
}

