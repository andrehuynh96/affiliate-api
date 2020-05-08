const Joi = require('joi');

const schema = Joi.object().keys({
  affiliateCodeId: Joi.string().min(8).max(32).required(),
});

module.exports = schema;
