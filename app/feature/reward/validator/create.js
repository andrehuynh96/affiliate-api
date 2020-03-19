const Joi = require('joi');

const schema = Joi.object().keys({
  currency_symbol: Joi.string().max(64).required(),
  from_date: Joi.string().required(),
  to_date: Joi.string().required(),
  details: Joi.array().items(Joi.object({
    user_id: Joi.string().max(64).required(),
    amount: Joi.number().greater(0).required(),
  }))
});

module.exports = schema;
