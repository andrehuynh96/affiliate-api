const Joi = require('joi');

const schema = Joi.object().keys({
  ext_client_id: Joi.string().max(250).required(),
  policies: Joi.array().items(
    Joi.number().greater(0).required(),
  )
});

module.exports = schema;
