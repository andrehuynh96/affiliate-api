const Joi = require('joi');

const membershipRateSchema = Joi.object().keys({
  membership_type_id: Joi.string().max(250).required(),
  rate: Joi.number().min(0).max(100).required(),
});

const createMembershipAffiliatePolicySchema = Joi.object().keys({
  name: Joi.string().max(250).required(),
  description: Joi.string().optional().allow('').allow(null).max(1000),
  type: Joi.string().max(250).required(),
  currency_symbol: Joi.string().allow('').allow(null).max(100).optional(),
  proportion_share: Joi.number().min(0).max(100).required(),
  max_levels: Joi.number().integer().min(1).required(),
  is_membership_system: Joi.boolean().optional(),
  rates: Joi.array().required().items(
    Joi.number().min(0).max(100).required(),
  ),
  membership_rates: Joi.array().required().items(membershipRateSchema),
});

module.exports = createMembershipAffiliatePolicySchema;
