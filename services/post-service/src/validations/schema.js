const Joi = require('joi');

const postSchema = Joi.object({
  content: Joi.string().min(1).max(3000).required(),
  media_urls: Joi.array().items(Joi.string().uri()).optional(),
  media_type: Joi.string().valid('image', 'video', 'document').optional(),
  visibility: Joi.string().valid('public', 'connections', 'private').default('public')
});

const commentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
  parent_comment_id: Joi.number().optional()
});

module.exports = { postSchema, commentSchema };