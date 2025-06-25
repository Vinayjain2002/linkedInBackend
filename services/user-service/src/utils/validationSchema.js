const Joi = require('joi');

const userRegistrationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    first_name: Joi.string().min(2).max(100).required(),
    last_name: Joi.string().min(2).max(100).required(),
    headline: Joi.string().max(500).optional(),
    location: Joi.string().max(255).optional(),
    industry: Joi.string().max(255).optional(),
    phone: Joi.string().max(20).optional()
});

const userLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const profileUpdateSchema = Joi.object({
    first_name: Joi.string().min(2).max(100).optional(),
    last_name: Joi.string().min(2).max(100).optional(),
    headline: Joi.string().max(500).optional(),
    summary: Joi.string().max(2000).optional(),
    location: Joi.string().max(255).optional(),
    industry: Joi.string().max(255).optional(),
    website_url: Joi.string().uri().optional(),
    phone: Joi.string().max(20).optional(),
    date_of_birth: Joi.date().optional()
});

module.exports = {
    userRegistrationSchema,
    userLoginSchema,
    profileUpdateSchema
};