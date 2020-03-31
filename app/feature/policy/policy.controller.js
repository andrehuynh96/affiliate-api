const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const mapper = require('app/response-schema/policy.response-schema');
const config = require('app/config');
const { PolicyService } = require('app/services');

const Container = typedi.Container;
const Op = Sequelize.Op;

const controller = {
  create: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body } = req;
      const name = _.trim(body.name);

      const policyService = Container.get(PolicyService);
      const data = {
        name,
        deleted_flg: false,
      };
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
      const { body, params } = req;
      const { policyId } = params;
      const name = _.trim(body.name);
      logger.info('Policy::update');

      const policyService = Container.get(PolicyService);
      const cond = {
        id: policyId,
        deleted_flg: false,
      };
      const data = {
        name,
      };
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
