const amqp = require('amqplib');
const dotenv= require('dotenv');

dotenv.config();

let channel= null;
let connection= null;

const connectRabbitMQ= async()=>{
    try{
        const connection= await amqp.connect(process.env.RABBITMQ_URL);
        connection.createChannel();

        await channel.assertQueue('user_registration', { durable: true });
        await channel.assertQueue('user_login', { durable: true });
        await channel.assertQueue('user_profile_update', { durable: true });
        await channel.assertQueue('password_reset', { durable: true });
        await channel.assertQueue('user_deletion', { durable: true });
        await channel.assertQueue('user_deletion_request', { durable: true });
        await channel.assertQueue('user_deletion_request_approval', { durable: true });
        await channel.assertQueue('user_deletion_request_rejection', { durable: true });
    }
    catch(err){
        console.error('Error connecting to RabbitMQ:', err);
        throw err;
    }
}

const getChannel= ()=>{
    if(!channel){
        throw new Error('RabbitMQ channel not initialized');
    }
    return channel;
}

const publishToQueue= async(queueName, data)=>{
    try{
        if(!channel){
            await connectRabbitMQ();
        }
        const message = {
            ...data,
            timestamp: new Date().toISOString(),
            service: 'user-service'
        };
        
        return channel.sendToQueue(
            queueName, 
            Buffer.from(JSON.stringify(message)), 
            { persistent: true }
        );
    }
    catch(error){
        console.error('Error publishing to RabbitMQ:', error);
        throw error;
    }
}

const closeConnection= async()=>{
    try{
        if(channel){
            await channel.close();
        }
        if(connection){
            await connection.close();
        }
        console.log("RabbitMQ Connection Closed");
    }
    catch(err){
        console.error('Error Closing RabbitMQ connection', err);
    }
};

module.exports={
    connectRabbitMQ,
    getChannel,
    publishToQueue,
    closeConnection
};