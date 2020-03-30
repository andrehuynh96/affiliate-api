const Joi = require('joi');

const schema = Joi.object().keys({
  organizationId: Joi.string().max(64).required(),
});

module.exports = schema;
