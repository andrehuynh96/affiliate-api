const Joi = require('joi');

const schema = Joi.object().keys({
  ext_client_id: Joi.string().max(250).required(),
  membership_type_id: Joi.string().allow('').allow(null).max(100).optional(),
  affiliate_code: Joi.string().allow('').allow(null).max(50).optional(),
});

module.exports = schema;
