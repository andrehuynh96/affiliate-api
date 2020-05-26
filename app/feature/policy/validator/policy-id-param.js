const Joi = require('joi');

const schema = Joi.object().keys({
  policyId: Joi.number().greater(0).required(),
});

module.exports = schema;
