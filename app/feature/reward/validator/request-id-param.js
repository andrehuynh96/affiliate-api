const Joi = require('joi');

const schema = Joi.object().keys({
  requestId: Joi.string().guid().required(),
});

module.exports = schema;
