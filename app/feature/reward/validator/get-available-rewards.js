const Joi = require('joi');

const schema = Joi.object().keys({
  ext_client_id: Joi.string().max(250).required(),
});

module.exports = schema;
