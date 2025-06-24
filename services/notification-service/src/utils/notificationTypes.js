const NOTIFICATION_TYPES = {
    CONNECTION_REQUEST: 'connection_request',
    POST_LIKE: 'post_like',
    POST_COMMENT: 'post_comment',
    MENTION: 'mention',
    MESSAGE: 'message',
    JOB_RECOMMENDATION: 'job_recommendation'
};

const NOTIFICATION_TITLES = {
    [NOTIFICATION_TYPES.CONNECTION_REQUEST]: 'New Connection Request',
    [NOTIFICATION_TYPES.POST_LIKE]: 'New Like',
    [NOTIFICATION_TYPES.POST_COMMENT]: 'New Comment',
    [NOTIFICATION_TYPES.MENTION]: 'You were mentioned',
    [NOTIFICATION_TYPES.MESSAGE]: 'New Message',
    [NOTIFICATION_TYPES.JOB_RECOMMENDATION]: 'Job Recommendation'
};

const NOTIFICATION_MESSAGES = {
    [NOTIFICATION_TYPES.CONNECTION_REQUEST]: 'You have received a new connection request',
    [NOTIFICATION_TYPES.POST_LIKE]: 'Someone liked your post',
    [NOTIFICATION_TYPES.POST_COMMENT]: 'Someone commented on your post',
    [NOTIFICATION_TYPES.MENTION]: 'Someone mentioned you in a post',
    [NOTIFICATION_TYPES.MESSAGE]: 'You have received a new message',
    [NOTIFICATION_TYPES.JOB_RECOMMENDATION]: 'We found a job that matches your profile'
};

module.exports = {
    NOTIFICATION_TYPES,
    NOTIFICATION_TITLES,
    NOTIFICATION_MESSAGES
};