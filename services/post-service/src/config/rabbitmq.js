const amqp= require('amqplib');
const dotenv= require('dotenv');
dotenv.config();

let channel;

const connectRabbitMQ= async()=>{
    try{
        const connection= await amqp.connect(process.env.RABBITMQ_URL);
        channel= await connection.createChannel();
        console.log('Connected to RabbitMQ');
    }
    catch(err){
        console.error('Error connecting to RabbitMQ:', err);
        throw err;
    }
};

module.exports= {connectRabbitMQ};