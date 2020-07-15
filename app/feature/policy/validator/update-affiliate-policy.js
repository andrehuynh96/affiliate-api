const Joi = require('joi');

const updateAffiliatePolicySchema = Joi.object().keys({
  name: Joi.string().max(250).required(),
  description: Joi.string().optional().allow('').allow(null).max(1000),
  type: Joi.string().max(250).required(),
  proportion_share: Joi.number().min(0).max(100).required(),
  max_levels: Joi.number().integer().min(1).optional(),
  is_membership_system: Joi.boolean().optional(),
  rates: Joi.array().required().items(
    Joi.number().min(0).max(100).required(),
  ),
});

module.exports = updateAffiliatePolicySchema;
