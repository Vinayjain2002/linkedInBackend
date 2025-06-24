const Joi = require('joi');

const notificationSchema = Joi.object({
    user_id: Joi.number().required(),
    sender_id: Joi.number().optional(),
    type: Joi.string().valid(
        'connection_request',
        'post_like',
        'post_comment',
        'mention',
        'message',
        'job_recommendation'
    ).required(),
    title: Joi.string().max(255).required(),
    message: Joi.string().required(),
    data: Joi.object().optional()
});

const settingsSchema = Joi.object({
    email_enabled: Joi.boolean().optional(),
    push_enabled: Joi.boolean().optional(),
    in_app_enabled: Joi.boolean().optional(),
    connection_requests: Joi.boolean().optional(),
    new_messages: Joi.boolean().optional(),
    post_likes: Joi.boolean().optional(),
    post_comments: Joi.boolean().optional(),
    mentions: Joi.boolean().optional()
});

const validateNotification = (req, res, next) => {
    const { error } = notificationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        });
    }
    next();
};

const validateSettings = (req, res, next) => {
    const { error } = settingsSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        });
    }
    next();
};

module.exports = {
    validateNotification,
    validateSettings
};