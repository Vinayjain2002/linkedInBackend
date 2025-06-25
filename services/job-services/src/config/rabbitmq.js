const amqp= require('amqplib');

let channel= null;

async function getChannel(){
    if(channel){
        return channel;
    }
    const connection= await amqp.connect(process.env.RABBITMQ_URL);
    channel= await connection.createChannel();
    return channel;
}

module.exports= {getChannel};