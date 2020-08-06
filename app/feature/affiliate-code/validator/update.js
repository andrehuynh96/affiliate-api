const Joi = require('joi');

const schema = Joi.object().keys({
  max_references: Joi.number().integer().min(0).required(),
});

module.exports = schema;
