const amqp = require('amqplib');
const analyticsModel = require('../models/analyticsModel.js');
const { updateDailyAnalytics } = require('../services/analyticsAggregationService.js');

let connection;
let channel;

async function startAnalyticsWorker() {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();

        // Declare queues
        await channel.assertQueue('analytics.events', { durable: true });
        await channel.assertQueue('analytics.aggregation', { durable: true });

        // Consume analytics events
        channel.consume('analytics.events', async (msg) => {
            try {
                const event = JSON.parse(msg.content.toString());
                await processAnalyticsEvent(event);
                channel.ack(msg);
            } catch (error) {
                console.error('Error processing analytics event:', error);
                channel.nack(msg);
            }
        });

        // Consume aggregation tasks
        channel.consume('analytics.aggregation', async (msg) => {
            try {
                const task = JSON.parse(msg.content.toString());
                await processAggregationTask(task);
                channel.ack(msg);
            } catch (error) {
                console.error('Error processing aggregation task:', error);
                channel.nack(msg);
            }
        });

        console.log('✅ Analytics worker started successfully');
    } catch (error) {
        console.error('❌ Failed to start analytics worker:', error);
        throw error;
    }
}

async function processAnalyticsEvent(event) {
    const { type, data } = event;

    switch (type) {
        case 'post_view':
            await handlePostView(data);
            break;
        case 'post_like':
            await handlePostLike(data);
            break;
        case 'post_comment':
            await handlePostComment(data);
            break;
        case 'post_share':
            await handlePostShare(data);
            break;
        case 'user_login':
            await handleUserLogin(data);
            break;
        default:
            console.log(`Unknown event type: ${type}`);
    }
}

async function handlePostView(data) {
    const { postId, userId } = data;
    
    // Update post analytics
    const analytics = await analyticsModel.getPostAnalytics(postId);
    if (analytics) {
        await analyticsModel.updatePostMetrics(postId, {
            views: analytics.views_count + 1,
            likes: analytics.likes_count,
            comments: analytics.comments_count,
            shares: analytics.shares_count,
            reach: analytics.reach_count,
            impressions: analytics.impressions_count + 1
        });
    }
}

async function handlePostLike(data) {
    const { postId, userId } = data;
    
    const analytics = await analyticsModel.getPostAnalytics(postId);
    if (analytics) {
        await analyticsModel.updatePostMetrics(postId, {
            views: analytics.views_count,
            likes: analytics.likes_count + 1,
            comments: analytics.comments_count,
            shares: analytics.shares_count,
            reach: analytics.reach_count,
            impressions: analytics.impressions_count
        });
    }
}

async function handlePostComment(data) {
    const { postId, userId } = data;
    
    const analytics = await analyticsModel.getPostAnalytics(postId);
    if (analytics) {
        await analyticsModel.updatePostMetrics(postId, {
            views: analytics.views_count,
            likes: analytics.likes_count,
            comments: analytics.comments_count + 1,
            shares: analytics.shares_count,
            reach: analytics.reach_count,
            impressions: analytics.impressions_count
        });
    }
}

async function handlePostShare(data) {
    const { postId, userId } = data;
    
    const analytics = await analyticsModel.getPostAnalytics(postId);
    if (analytics) {
        await analyticsModel.updatePostMetrics(postId, {
            views: analytics.views_count,
            likes: analytics.likes_count,
            comments: analytics.comments_count,
            shares: analytics.shares_count + 1,
            reach: analytics.reach_count + 10, // Estimate reach increase
            impressions: analytics.impressions_count
        });
    }
}

async function handleUserLogin(data) {
    const { userId } = data;
    
    // Update user analytics
    const userAnalytics = await analyticsModel.getUserAnalytics(userId);
    if (userAnalytics) {
        await analyticsModel.updateUserAnalytics(userId, {
            ...userAnalytics,
            lastActivity: new Date()
        });
    }
}

async function processAggregationTask(task) {
    const { type, date } = task;

    switch (type) {
        case 'daily_aggregation':
            await updateDailyAnalytics(date);
            break;
        default:
            console.log(`Unknown aggregation task: ${type}`);
    }
}

module.exports = { startAnalyticsWorker };