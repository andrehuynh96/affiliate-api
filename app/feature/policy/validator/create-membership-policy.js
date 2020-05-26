const Joi = require('joi');

const createMembershipPolicySchema = Joi.object().keys({
  name: Joi.string().max(250).required(),
  description: Joi.string().optional().allow('').max(1000),
  type: Joi.string().max(250).required(),
  proportion_share: Joi.number().min(0).max(100).required(),
  max_levels: Joi.number().integer().min(1).required(),
  membership_rate: Joi.object({
    SILVER: Joi.number().min(0).max(100).required(),
    GOLD: Joi.number().min(0).max(100).required(),
    PLATINUM: Joi.number().min(0).max(100).required(),
    DIAMOND: Joi.number().min(0).max(100).required(),
  }),
});

module.exports = createMembershipPolicySchema;
