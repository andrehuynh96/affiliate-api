const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const joi = require('joi');
const db = require('app/model');
const mapper = require('app/response-schema/policy.response-schema');
const config = require('app/config');
const MembershipType = require('app/model/value-object/policy-type');
const PolicyTypeName = require('app/model/value-object/policy-type-name');
const {
  PolicyService,
  AffiliateTypeService,
} = require('app/services');
const {
  createMembershipPolicySchema,
  createMembershipAffiliatePolicySchema,
  createAffiliatePolicySchema,
  updateMembershipPolicySchema,
  updateMembershipAffiliatePolicySchema,
  updateAffiliatePolicySchema,
} = require('app/feature/policy/validator');
const {
  MembershipPolicy,
  MembershipAffiliatePolicy,
  AffiliatePolicy,
} = require('app/classes/policies');

const Container = typedi.Container;
const Op = Sequelize.Op;

const controller = {
  search: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      logger.info('Policy::search');
      const { query, affiliateTypeId, organizationId } = req;
      const { offset, limit } = query;
      const keyword = _.trim(query.keyword);
      const { affiliateType, policies } = await controller.getPoliciesByAffiliateTypeId(organizationId, affiliateTypeId);
      const policyIdList = policies.map(x => x.id);
      const condition = {
        id: policyIdList,
        organization_id: organizationId,
        deleted_flg: false,
      };
      if (keyword) {
        condition.name = {
          [Op.iLike]: keyword,
        };
      }

      const off = parseInt(offset || 0);
      const lim = parseInt(limit || Number.MAX_SAFE_INTEGER);
      const order = [['created_at', 'DESC']];
      const policyService = Container.get(PolicyService);
      const { count: total, rows: items } = await policyService.findAndCountAll({ condition, offset: off, limit: lim, order });
      items.forEach(item => item.type = PolicyTypeName[item.type]);

      return res.ok({
        items: mapper(items),
        offset: off,
        limit: lim,
        total: total
      });
    }
    catch (err) {
      logger.error('search policys fail: ', err);
      next(err);
    }
  },

  create: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body, affiliateTypeId, organizationId } = req;
      const { type } = body;
      if (!MembershipType[type]) {
        return res.badRequest(res.__('CREATE_POLICY_TYPE_IS_INVALID'), 'CREATE_POLICY_TYPE_IS_INVALID', { fields: ['type'] });
      }

      let schema;
      let classInstance;
      switch (type) {
        case MembershipType.MEMBERSHIP:
          schema = createMembershipPolicySchema;
          classInstance = new MembershipPolicy(body);
          break;

        case MembershipType.MEMBERSHIP_AFFILIATE:
          schema = createMembershipAffiliatePolicySchema;
          classInstance = new MembershipAffiliatePolicy(body);
          break;

        case MembershipType.AFFILIATE:
          schema = createAffiliatePolicySchema;
          classInstance = new AffiliatePolicy(body);
          break;
      }

      // Validate policy
      const result = joi.validate(body, schema);
      if (result.error) {
        const err = {
          details: result.error.details,
        };

        return res.badRequest('Bad Request', '', err);
      }

      if (type === MembershipType.AFFILIATE || type === MembershipType.MEMBERSHIP_AFFILIATE) {
        const { rates } = classInstance;
        const total = rates.reduce((result, value) => {
          result = result + Number(value);

          return result;
        }, 0);

        if (total > 100) {
          const errorMessage = res.__('TOTAL_RATE_IS_EXCEED_100', total);
          return res.forbidden(errorMessage, 'TOTAL_RATE_IS_EXCEED_100', { fields: ['rates'] });
        }
      }

      const transaction = await db.sequelize.transaction();
      try {
        const policyService = Container.get(PolicyService);
        const affiliateTypeService = Container.get(AffiliateTypeService);
        const affiliateType = await affiliateTypeService.findByPk(affiliateTypeId);
        const data = {
          ...classInstance,
          organization_id: organizationId,
        };
        delete data.id;
        const policy = await policyService.create(data, { transaction });
        await policy.addAffiliateType(affiliateType, { transaction });
        await transaction.commit();

        return res.ok(mapper(policy));
      } catch (error) {
        await transaction.rollback();

        throw error;
      }
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },

  getById: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body, params, affiliateTypeId, organizationId } = req;
      const { policyId } = params;
      logger.info('Policy::getById', policyId);
      const policy = await controller.getPolicy(organizationId, affiliateTypeId, policyId);

      if (!policy) {
        return res.notFound(res.__('POLICY_IS_NOT_FOUND'), 'POLICY_IS_NOT_FOUND');
      }

      return res.ok(mapper(policy));
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },

  update: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      logger.info('Policy::update');
      const { body, params, affiliateTypeId, organizationId } = req;
      const { policyId } = params;
      const policyService = Container.get(PolicyService);
      const policy = await controller.getPolicy(organizationId, affiliateTypeId, policyId);

      if (!policy) {
        return res.notFound(res.__('POLICY_IS_NOT_FOUND'), 'POLICY_IS_NOT_FOUND');
      }

      const type = policy.type;
      body.type = type;
      let schema;
      let classInstance;
      switch (type) {
        case MembershipType.MEMBERSHIP:
          schema = updateMembershipPolicySchema;
          classInstance = new MembershipPolicy(body);
          break;

        case MembershipType.MEMBERSHIP_AFFILIATE:
          schema = updateMembershipAffiliatePolicySchema;
          classInstance = new MembershipAffiliatePolicy(body);
          break;

        case MembershipType.AFFILIATE:
          schema = updateAffiliatePolicySchema;
          classInstance = new AffiliatePolicy(body);
          break;
      }

      // Validate policy
      const result = joi.validate(body, schema);
      if (result.error) {
        const err = {
          details: result.error.details,
        };

        return res.badRequest(res.__('MISSING_PARAMETERS'), 'MISSING_PARAMETERS', { err });
      }

      if (type === MembershipType.AFFILIATE || type === MembershipType.MEMBERSHIP_AFFILIATE) {
        const { rates } = classInstance;
        const total = rates.reduce((result, value) => {
          result = result + Number(value);

          return result;
        }, 0);

        if (total > 100) {
          const errorMessage = res.__('TOTAL_RATE_IS_EXCEED_100', total);
          return res.forbidden(errorMessage, 'TOTAL_RATE_IS_EXCEED_100', { fields: ['rates'] });
        }
      }

      const cond = {
        id: policyId,
      };
      const data = classInstance;
      delete data.id;
      const [numOfItems, items] = await policyService.updateWhere(cond, data);

      if (!numOfItems) {
        return res.notFound(res.__('POLICY_IS_NOT_FOUND'), 'POLICY_IS_NOT_FOUND');
      }

      return res.ok(mapper(items[0]));
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },

  delete: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body, params } = req;
      const { policyId } = params;
      logger.info('Policy::delete');

      const policyService = Container.get(PolicyService);
      const cond = {
        id: policyId,
        deleted_flg: false,
      };
      const data = {
        deleted_flg: true,
      };
      const [numOfItems, items] = await policyService.updateWhere(cond, data);

      if (!numOfItems) {
        return res.notFound(res.__('POLICY_IS_NOT_FOUND'), 'POLICY_IS_NOT_FOUND');
      }

      return res.ok({ deleted: true });
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },

  // Private functions
  getPoliciesByAffiliateTypeId: async (organizationId, affiliateTypeId) => {
    const affiliateTypeService = Container.get(AffiliateTypeService);

    const cond = {
      id: affiliateTypeId,
      organization_id: organizationId,
      deleted_flg: false,
    };
    const affiliateType = await affiliateTypeService.findOne(cond);
    const defaultPolicies = await affiliateType.getDefaultPolicies();

    return {
      affiliateType,
      policies: defaultPolicies
    };
  },
  getPolicy: async (organizationId, affiliateTypeId, policyId) => {
    const { affiliateType, policies } = await controller.getPoliciesByAffiliateTypeId(organizationId, affiliateTypeId);
    const policy = await policies.find(x => x.id === Number(policyId));

    return policy;
  }


};

module.exports = controller;
