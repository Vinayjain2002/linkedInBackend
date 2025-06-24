const Joi = require('joi');

exports.connectionSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'id must be a number',
      'number.integer': 'id must be an integer',
      'number.min': 'id must be greater than 0'
    }),

  requesterId: Joi.number()
    .integer()
    .required()
    .messages({
      'any.required': 'requesterId is required',
      'number.base': 'requesterId must be a number',
      'number.integer': 'requesterId must be an integer'
    }),

  addresseeId: Joi.number()
    .integer()
    .required()
    .messages({
      'any.required': 'addresseeId is required',
      'number.base': 'addresseeId must be a number',
      'number.integer': 'addresseeId must be an integer'
    }),

  status: Joi.string()
    .valid('pending', 'accepted', 'rejected')
    .default('pending')
    .messages({
      'any.only': 'status must be one of: pending, accepted, rejected',
      'string.base': 'status must be a string'
    }),

  createdAt: Joi.date()
    .optional()
    .messages({
      'date.base': 'createdAt must be a valid date'
    }),

  updatedAt: Joi.date()
    .optional()
    .messages({
      'date.base': 'updatedAt must be a valid date'
    })
});
