const Joi = require('joi');

const schema = Joi.object().keys({
  name: Joi.string().max(250).required(),
  description: Joi.string().optional().allow('').max(1000).required(),
  policies: Joi.array().items(
    Joi.number().greater(0).required(),
  )
});

module.exports = schema;
