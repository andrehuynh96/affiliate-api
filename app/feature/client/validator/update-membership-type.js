const Joi = require('joi');

const schema = Joi.object().keys({
  ext_client_id: Joi.string().max(250).required(),
  membership_type_id: Joi.string().optional().allow('').max(50),
});

module.exports = schema;
