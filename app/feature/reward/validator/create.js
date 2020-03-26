const Joi = require('joi');

const schema = Joi.object().keys({
  currency_symbol: Joi.string().max(64).required(),
  from_date: Joi.date().iso().required(),
  to_date: Joi.date().iso().required(),
  details: Joi.array().items(Joi.object({
    ext_client_id: Joi.string().max(250).required(),
    amount: Joi.number().greater(0).required(),
  }))
});

module.exports = schema;
