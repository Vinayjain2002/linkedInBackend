const redis= require('redis');
const client= redis.createClient({
    url: process.env.REDIS_URL
});

const connectRedis= async ()=>{
    try{
        await client.connect();
        console.log('Connected to Redis');
    }
    catch(err){
        console.error('Error connecting to Redis:', err);
        throw err;
    }
};

client.on('error', (err)=>{
    console.error('Redis Error:', err);
});

module.exports= {client, connectRedis};