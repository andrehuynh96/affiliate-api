const Joi = require('joi');

const schema = Joi.object().keys({
  currency_symbol: Joi.string().max(64).required(),
  ext_client_id: Joi.string().max(250).required(),
  amount: Joi.number().greater(0).required(),
  latest_id: Joi.number().integer().min(1).required(),
});

module.exports = schema;
