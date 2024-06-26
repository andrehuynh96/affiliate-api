const Joi = require('joi');

const schema = Joi.object().keys({
  ext_client_id: Joi.string().max(250).required(),
  // affiliate_code: Joi.string().optional().allow('').max(64),
  affiliate_code: Joi.string().max(64).required(),
});

module.exports = schema;
