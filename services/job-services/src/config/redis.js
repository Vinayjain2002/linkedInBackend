const redis= require('redis');
const dotenv= require('dotenv');

dotenv.config();

const client= redis.createClient({
    url: process.env.REDIS_URL
});

async function connectRedis(){
    if(client.isOpen){
        console.log("Redis CLient is Already Connected");
    }
    try{
        await client.connect();
        console.log("Connected to Redis");
        return client;
    }
    catch(err){
        console.error("Error connecting to Redis:", err);
        throw err;
    }
}

module.exports= {client, connectRedis};