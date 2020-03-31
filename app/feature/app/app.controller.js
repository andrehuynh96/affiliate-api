const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const v4 = require('uuid/v4');
const mapper = require('app/response-schema/app.response-schema');
const config = require('app/config');
const { AppService, OrganizationService } = require('app/services');

const Container = typedi.Container;
const Op = Sequelize.Op;

const controller = {
  create: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body, params } = req;
      const { organizationId } = params;
      const { name } = body;

      const organizationService = Container.get(OrganizationService);
      const organization = await organizationService.findByPk(organizationId);
      if (!organization) {
        return res.notFound(res.__('ORGANIZATION_NOT_FOUND'), 'ORGANIZATION_NOT_FOUND');
      }

      const appService = Container.get(AppService);
      const data = {
        name,
        api_key: v4(),
        // eslint-disable-next-line no-useless-escape
        secret_key: (v4() + v4()).replace(/\-/g, ''),
        organization_id: organization.id,
        actived_flg: true,
        deleted_flg: false,
      };
      const app = await appService.create(data);

      return res.ok(mapper(app));
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
      const { organizationId, appId } = params;
      const name = _.trim(body.name);
      logger.info('App::getById', appId);

      const appService = Container.get(AppService);
      const cond = {
        id: appId,
        organization_id: organizationId,
        deleted_flg: false,
      };
      const app = await appService.findOne(cond);

      if (!app) {
        return res.notFound(res.__('APP_IS_NOT_FOUND'), 'APP_IS_NOT_FOUND');
      }

      return res.ok(mapper(app));
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },

  search: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { query, params } = req;
      const { organizationId } = params;
      const { offset, limit } = query;

      const keyword = _.trim(query.keyword);
      logger.info('App::search');

      const condition = {
        organization_id: organizationId,
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
      const appService = Container.get(AppService);
      const { count: total, rows: items } = await appService.findAndCountAll({ condition, offset: off, limit: lim, order });

      return res.ok({
        items: mapper(items),
        offset: off,
        limit: lim,
        total: total
      });
    }
    catch (err) {
      logger.error('search apps fail: ', err);
      next(err);
    }
  },

  update: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body, params } = req;
      const { organizationId, appId } = params;
      const { name } = body;
      logger.info('App::update');

      const appService = Container.get(AppService);
      const cond = {
        id: appId,
        organization_id: organizationId,
        deleted_flg: false,
      };
      const data = {
        name,
      };
      const [numOfItems, items] = await appService.updateWhere(cond, data);

      if (!numOfItems) {
        return res.notFound(res.__('APP_IS_NOT_FOUND'), 'APP_IS_NOT_FOUND');
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
      const { organizationId, appId } = params;
      logger.info('App::delete');

      const appService = Container.get(AppService);
      const cond = {
        id: appId,
        organization_id: organizationId,
        deleted_flg: false,
      };
      const data = {
        deleted_flg: true,
      };
      const [numOfItems, items] = await appService.updateWhere(cond, data);

      if (!numOfItems) {
        return res.notFound(res.__('APP_IS_NOT_FOUND'), 'APP_IS_NOT_FOUND');
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
