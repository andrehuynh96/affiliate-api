const Joi = require('joi');

const schema = Joi.object().keys({
  organizationId: Joi.string().guid().required(),
  affiliateTypeId: Joi.number().greater(0).required(),
});

module.exports = schema;
