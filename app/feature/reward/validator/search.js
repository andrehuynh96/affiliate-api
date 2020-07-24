const Joi = require('joi');

const schema = Joi.object().keys({
  from_date: Joi.date().iso().optional(),
  to_date: Joi.date().iso().optional(),
  currency: Joi.string().allow('').allow(null).max(100).optional(),
  status: Joi.string().allow('').allow(null).max(100).optional(),
  email: Joi.string().optional(),
  offset: Joi.number().min(0).required(),
  limit: Joi.number().greater(0).required(),
});

module.exports = schema;
