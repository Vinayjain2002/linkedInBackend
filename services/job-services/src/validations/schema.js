const Joi = require('joi');

const jobSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
  company: Joi.string().required(),
  salary: Joi.number().optional(),
  type: Joi.string().valid('full-time', 'part-time', 'contract', 'internship').required()
});

const applicationSchema = Joi.object({
  cover_letter: Joi.string().allow(''),
  resume_url: Joi.string().uri().optional()
});

module.exports = { jobSchema, applicationSchema };