const Joi = require('joi');

const schema = Joi.object().keys({
  membershipTypes: Joi.array().required()
});

module.exports = schema;