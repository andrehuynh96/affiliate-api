const Joi = require('joi');

const schema = Joi.object().keys({
  organizationId: Joi.string().guid().required(),
  appId: Joi.string().guid().required(),
});

module.exports = schema;
