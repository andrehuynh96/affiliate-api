const Joi = require('joi');

const schema = Joi.object().keys({
  claimRewardId: Joi.string().guid().required(),
});

module.exports = schema;
