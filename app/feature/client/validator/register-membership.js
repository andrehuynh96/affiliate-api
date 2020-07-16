const Joi = require('joi');

const schema = Joi.object().keys({
  ext_client_id: Joi.string().max(250).required(),
  affiliate_code: Joi.string().max(50).required(),
  membership_type_id: Joi.string().max(50).required(),
  membership_order_id: Joi.string().max(50).required(),
  amount: Joi.number().greater(0).required(),
  currency_symbol: Joi.string().max(100).required(),
});

module.exports = schema;
