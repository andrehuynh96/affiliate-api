const Joi = require('joi');

const schema = Joi.object().keys({
  keyword: Joi.string().optional().allow('').max(64),
  offset: Joi.number().min(0).optional(),
  limit: Joi.number().greater(0).optional(),
});

module.exports = schema;
