const Joi = require('joi');

const schema = Joi.object().keys({
  name: Joi.string().max(250).required(),
});

module.exports = schema;
