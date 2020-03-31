const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const joi = require('joi');
const mapper = require('app/response-schema/policy.response-schema');
const config = require('app/config');
const { PolicyService } = require('app/services');
const MembershipType = require('app/model/value-object/policy-type');
const {
  createMembershipPolicySchema,
  createMembershipAffiliatePolicySchema,
  createAffiliatePolicySchema,
} = require('app/feature/policy/validator');
const {
  MembershipPolicy,
  MembershipAffiliatePolicy,
  AffiliatePolicy,
} = require('app/classes/policies');

const Container = typedi.Container;
const Op = Sequelize.Op;

const controller = {
  create: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const body = Object.assign({}, req.body);
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

      const policyService = Container.get(PolicyService);
      const data = classInstance;
      delete data.id;

      const policy = await policyService.create(data);

      return res.ok(mapper(policy));
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },

  getById: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body, params } = req;
      const { policyId } = params;
      const name = _.trim(body.name);
      logger.info('Policy::getById', policyId);

      const policyService = Container.get(PolicyService);
      const cond = {
        id: policyId,
        deleted_flg: false,
      };
      const policy = await policyService.findOne(cond);

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

  search: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { query } = req;
      const { offset, limit } = query;
      const keyword = _.trim(query.keyword);
      logger.info('Policy::search');

      const condition = {
        deleted_flg: false,
      };
      if (keyword) {
        condition.name = {
          [Op.substring]: keyword,
        };
      }

      const off = parseInt(offset);
      const lim = parseInt(limit);
      const order = [['created_at', 'DESC']];
      const policyService = Container.get(PolicyService);
      const { count: total, rows: items } = await policyService.findAndCountAll({ condition, offset: off, limit: lim, order });

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

  update: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { params } = req;
      const { policyId } = params;
      const body = Object.assign({}, req.body);
      const { type } = body;
      if (!MembershipType[type]) {
        return res.badRequest(res.__('UPDATE_POLICY_TYPE_IS_INVALID'), 'UPDATE_POLICY_TYPE_IS_INVALID', { fields: ['type'] });
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

      logger.info('Policy::update');

      const policyService = Container.get(PolicyService);
      const cond = {
        id: policyId,
        type,
        deleted_flg: false,
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

};

module.exports = controller;
