const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const v4 = require('uuid/v4');
const mapper = require('app/response-schema/affiliate-type.response-schema');
const config = require('app/config');
const { AffiliateTypeService, OrganizationService } = require('app/services');

const Container = typedi.Container;
const Op = Sequelize.Op;

const controller = {
  create: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body, params } = req;
      const { organizationId } = params;
      const { name, description } = body;

      const organizationService = Container.get(OrganizationService);
      const organization = await organizationService.findByPk(organizationId);
      if (!organization) {
        return res.notFound(res.__('ORGANIZATION_NOT_FOUND'), 'ORGANIZATION_NOT_FOUND');
      }

      const affiliateTypeService = Container.get(AffiliateTypeService);
      const data = {
        name,
        description,
        organization_id: organization.id,
        actived_flg: true,
        deleted_flg: false,
      };
      const affiliateType = await affiliateTypeService.create(data);

      return res.ok(mapper(affiliateType));
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
      const { organizationId, affiliateTypeId } = params;
      logger.info('AffiliateType::getById', affiliateTypeId);

      const affiliateTypeService = Container.get(AffiliateTypeService);
      const cond = {
        id: affiliateTypeId,
        organization_id: organizationId,
        deleted_flg: false,
      };
      const affiliateType = await affiliateTypeService.findOne(cond);

      if (!affiliateType) {
        return res.notFound(res.__('AFFILIATE_TYPE_IS_NOT_FOUND'), 'AFFILIATE_TYPE_IS_NOT_FOUND');
      }

      return res.ok(mapper(affiliateType));
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
      logger.info('AffiliateType::search');

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
      const affiliateTypeService = Container.get(AffiliateTypeService);
      const { count: total, rows: items } = await affiliateTypeService.findAndCountAll({ condition, offset: off, limit: lim, order });

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
      const { organizationId, affiliateTypeId } = params;
      const { name, description } = body;
      logger.info('AffiliateType::update');

      const affiliateTypeService = Container.get(AffiliateTypeService);
      const cond = {
        id: affiliateTypeId,
        organization_id: organizationId,
        deleted_flg: false,
      };
      const data = {
        name,
        description,
      };
      const [numOfItems, items] = await affiliateTypeService.updateWhere(cond, data);

      if (!numOfItems) {
        return res.notFound(res.__('AFFILIATE_TYPE_IS_NOT_FOUND'), 'AFFILIATE_TYPE_IS_NOT_FOUND');
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
      const { organizationId, affiliateTypeId } = params;
      logger.info('AffiliateType::delete');

      const affiliateTypeService = Container.get(AffiliateTypeService);
      const cond = {
        id: affiliateTypeId,
        organization_id: organizationId,
        deleted_flg: false,
      };
      const data = {
        deleted_flg: true,
      };
      const [numOfItems, items] = await affiliateTypeService.updateWhere(cond, data);

      if (!numOfItems) {
        return res.notFound(res.__('AFFILIATE_TYPE_IS_NOT_FOUND'), 'AFFILIATE_TYPE_IS_NOT_FOUND');
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
