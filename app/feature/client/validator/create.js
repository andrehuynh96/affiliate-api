const Joi = require('joi');

const schema = Joi.object().keys({
  ext_client_id: Joi.string().max(250).required(),
  affiliate_code: Joi.string().optional().allow('').max(64),
  membership_type: Joi.string().optional().allow('').max(64),
});

module.exports = schema;
