import amqp from 'amqplib';
import dotenv from 'dotenv';
dotenv.config();

let channel;

export const connectRabbitMQ= async()=>{
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

export const getChannel= async()=>{
    return channel;
};
