const Joi = require('joi');

const schema = Joi.object().keys({
  requestDetailId: Joi.number().required(),
});

module.exports = schema;