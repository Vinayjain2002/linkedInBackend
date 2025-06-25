const { channel } = require('../config/rabbitmq.js');
const EmailService = require('../services/emailService.js');
const { client: redisClient } = require('../config/redis.js');

const emailService = new EmailService();

const processEmailNotifications = async () => {
    try {
        await channel.consume('email_notifications', async (msg) => {
            if (msg) {
                const notification = JSON.parse(msg.content.toString());
                
                // Get user email from cache or database
                const userEmail = await redisClient.get(`user_email_${notification.user_id}`);
                
                if (userEmail) {
                    await emailService.sendNotificationEmail(notification, userEmail);
                    channel.ack(msg);
                }
                
            }
        });
        
        console.log('Email notification worker started');
    } catch (error) {
        console.error('Error in email notification worker:', error);
    }
};

const processPushNotifications = async () => {
    try {
        await channel.consume('push_notifications', async (msg) => {
            if (msg) {
                const notification = JSON.parse(msg.content.toString());
                
                // Here you would integrate with push notification service
                // like Firebase Cloud Messaging or Apple Push Notification Service
                console.log('Processing push notification for user:', notification.user_id);
                
                channel.ack(msg);
            }
        });
        
        console.log('Push notification worker started');
    } catch (error) {
        console.error('Error in push notification worker:', error);
    }
};

const startWorkers = async () => {
    await processEmailNotifications();
    await processPushNotifications();
};

if (require.main === module) {
    startWorkers();
}

module.exports = { startWorkers };