const Joi = require('joi');

const schema = Joi.object().keys({
  platinum: Joi.array().items(
    Joi.string().optional(),
  ).required(),
  gold: Joi.array().items(
    Joi.string().optional(),
  ).required(),
});

module.exports = schema;
