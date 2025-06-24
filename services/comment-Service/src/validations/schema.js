const Joi = require('joi');

exports.createCommentSchema = Joi.object({
  postId: Joi.number().integer().required(),
  content: Joi.string().min(1).max(1000).required(),
});

exports.deleteCommentSchema = Joi.object({
  commentId: Joi.number().integer().required(),
});
