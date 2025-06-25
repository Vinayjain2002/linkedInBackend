const amqp = require('amqplib');

let connection;
let channel;

async function connect() {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();
        
        // Declare queues for analytics events
        await channel.assertQueue('analytics.events', { durable: true });
        await channel.assertQueue('analytics.reports', { durable: true });
        
        console.log('📊 Connected to RabbitMQ for Analytics');
        return { connection, channel };
    } catch (error) {
        console.error('❌ RabbitMQ connection error:', error);
        throw error;
    }
}

async function publishEvent(queue, data) {
    try {
        if (!channel) await connect();
        return channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), { persistent: true });
    } catch (error) {
        console.error('❌ Error publishing event:', error);
        throw error;
    }
}

module.exports = { connect, publishEvent, getChannel: () => channel };