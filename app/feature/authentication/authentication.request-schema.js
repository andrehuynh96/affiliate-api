const Joi = require('joi');

const schema = Joi.object().keys({
  api_key: Joi.string().required(),
  secret_key: Joi.string().required(),
  grant_type: Joi.string().valid(['client_credentials', 'refresh_token']),
});

module.exports = schema;
