const Joi = require('joi');

const schema = Joi.object().keys({
  ext_client_id: Joi.string().max(250).required(),
  affiliate_code: Joi.string().max(50).required(),
  membership_type_id: Joi.string().max(50).required(),
});

module.exports = schema;
