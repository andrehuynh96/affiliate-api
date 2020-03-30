const Joi = require('joi');

const schema = Joi.object().keys({
  name: Joi.string().max(250).required(),
  description: Joi.string().optional().allow('').max(1000).required(),
});

module.exports = schema;
