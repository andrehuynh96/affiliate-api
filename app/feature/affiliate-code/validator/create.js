const Joi = require('joi');

const schema = Joi.object().keys({
  user_id: Joi.string().max(64).required(),
  affiliate_code: Joi.string().optional().allow('').max(64),
});

module.exports = schema;
