const amqp= require('amqplib');
const dotenv= require('dotenv');

dotenv.config();

let channel= null;

const connectRabbitMQ= async()=>{
    try{
        const connection= await amqp.connect(process.env.RABBITMQ_URL);
        channel= await connection.createChannel();
        await channel.assertQueue('job_queue', {durable: true});

        console.log("Connected to RabbitMQ");
    }
    catch(err){
        console.error("Error connecting to RabbitMQ:", err);
        throw err;
    }
}


async function getChannel(){
    if(channel){
        return channel;
    }
    connectRabbitMQ();
    return channel;
}

module.exports= {getChannel, connectRabbitMQ};