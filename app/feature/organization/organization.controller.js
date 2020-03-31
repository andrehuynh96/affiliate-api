const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const mapper = require('app/response-schema/organization.response-schema');
const config = require('app/config');
const { OrganizationService } = require('app/services');

const Container = typedi.Container;
const Op = Sequelize.Op;

const controller = {
  create: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body } = req;
      const name = _.trim(body.name);

      const organizationService = Container.get(OrganizationService);
      const data = {
        name,
        deleted_flg: false,
      };
      const organization = await organizationService.create(data);

      return res.ok(mapper(organization));
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
      const { organizationId } = params;
      const name = _.trim(body.name);
      logger.info('Organization::getById', organizationId);

      const organizationService = Container.get(OrganizationService);
      const cond = {
        id: organizationId,
        deleted_flg: false,
      };
      const organization = await organizationService.findOne(cond);

      if (!organization) {
        return res.notFound(res.__('ORGANIZATION_IS_NOT_FOUND'), 'ORGANIZATION_IS_NOT_FOUND');
      }

      return res.ok(mapper(organization));
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
      logger.info('Organization::search');

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
      const organizationService = Container.get(OrganizationService);
      const { count: total, rows: items } = await organizationService.findAndCountAll({ condition, offset: off, limit: lim, order });

      return res.ok({
        items: mapper(items),
        offset: off,
        limit: lim,
        total: total
      });
    }
    catch (err) {
      logger.error('search organizations fail: ', err);
      next(err);
    }
  },

  update: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body, params } = req;
      const { organizationId } = params;
      const name = _.trim(body.name);
      logger.info('Organization::update');

      const organizationService = Container.get(OrganizationService);
      const cond = {
        id: organizationId,
        deleted_flg: false,
      };
      const data = {
        name,
      };
      const [numOfItems, items] = await organizationService.updateWhere(cond, data);

      if (!numOfItems) {
        return res.notFound(res.__('ORGANIZATION_IS_NOT_FOUND'), 'ORGANIZATION_IS_NOT_FOUND');
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
      const { organizationId } = params;
      logger.info('Organization::delete');

      const organizationService = Container.get(OrganizationService);
      const cond = {
        id: organizationId,
        deleted_flg: false,
      };
      const data = {
        deleted_flg: true,
      };
      const [numOfItems, items] = await organizationService.updateWhere(cond, data);

      if (!numOfItems) {
        return res.notFound(res.__('ORGANIZATION_IS_NOT_FOUND'), 'ORGANIZATION_IS_NOT_FOUND');
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
