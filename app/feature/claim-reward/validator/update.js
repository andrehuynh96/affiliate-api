const Joi = require('joi');

const schema = Joi.object().keys({
  status: Joi.string().max(250).required(),
  id_list: Joi.array().required().items(
    Joi.string().guid().required(),
  ),
});

module.exports = schema;
