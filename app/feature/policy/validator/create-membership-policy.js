const Joi = require('joi');

const membershipRateSchema = Joi.object().keys({
  membership_type_id: Joi.string().max(250).required(),
  rate: Joi.number().min(0).max(100).required(),
});

const createMembershipPolicySchema = Joi.object().keys({
  name: Joi.string().max(250).required(),
  description: Joi.string().optional().allow('').max(1000),
  type: Joi.string().max(250).required(),
  proportion_share: Joi.number().min(0).max(100).required(),
  is_membership_system: Joi.boolean().optional(),
  membership_rates: Joi.array().items(membershipRateSchema),
});

module.exports = createMembershipPolicySchema;
