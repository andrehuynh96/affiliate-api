const Joi = require('joi');

const schema = Joi.object().keys({
  ext_client_id: Joi.string().max(250).required(),
  offset: Joi.number().min(0).required(),
  limit: Joi.number().greater(0).required(),
});

module.exports = schema;
