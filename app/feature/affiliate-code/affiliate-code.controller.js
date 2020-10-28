const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const db = require('app/model');
const {
  AffiliateCodeService,
  ClientService,
  ClientAffiliateService,
  AffiliateTypeService,
  AffiliateCodeStatisticsService,
  MembershipTypeService
} = require('app/services');
const mapper = require('app/response-schema/affiliate-code.response-schema');
const { policyHelper, clientHelper } = require('app/lib/helpers');
const PolicyType = require('app/model/value-object/policy-type');
const MembershipTypeName = require('app/model/value-object/membership-type-name');

const Op = Sequelize.Op;
const sequelize = db.sequelize;
const { Container, Service } = typedi;

const controller = {
  search: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      logger.info('AffiliateCode::search');
      const { query, affiliateTypeId, organizationId } = req;
      const { offset, limit } = query;
      const keyword = _.trim(query.keyword);
      const condition = {
        deleted_flg: false,
      };

      const off = parseInt(offset || 0);
      const lim = parseInt(limit || Number.MAX_SAFE_INTEGER);
      const order = [['created_at', 'DESC']];
      const affiliateCodeService = Container.get(AffiliateCodeService);
      const { count: total, rows: items } = await affiliateCodeService.findAndCountAll({ condition, offset: off, limit: lim, order });

      return res.ok({
        items: mapper(items),
        offset: off,
        limit: lim,
        total: total
      });
    }
    catch (err) {
      logger.error('search affiliate code: ', err);
      next(err);
    }
  },
  getById: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body, affiliateTypeId, params } = req;
      let { code } = params;
      code = _.trim(code).toUpperCase();
      logger.info('AffiliateCode::getById', code);
      const affiliateCodeService = Container.get(AffiliateCodeService);
      const affiliateCode = await affiliateCodeService.findByPk(code);

      if (!affiliateCode) {
        return res.notFound(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE');
      }

      const clientService = Container.get(ClientService);
      const client = await clientService.findByClientAffiliateId(affiliateCode.client_affiliate_id, affiliateTypeId);
      if (!client) {
        return res.notFound(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE');
      }

      affiliateCode.max_references = affiliateCode.max_references || 0;
      const ext_client_id = client.ext_client_id;
      const result = Object.assign({}, affiliateCode.get({ plain: true }), { ext_client_id });

      return res.ok(mapper(result));
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },
  updateReferenceCode: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body, affiliateTypeId, params } = req;
      let { code } = params;
      code = _.trim(code).toUpperCase();
      logger.info('AffiliateCode::update', code);
      const max_references = body.max_references;
      const affiliateCodeService = Container.get(AffiliateCodeService);
      const affiliateCode = await affiliateCodeService.findByPk(code);

      if (!affiliateCode) {
        return res.notFound(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE');
      }

      const clientService = Container.get(ClientService);
      const client = await clientService.findByClientAffiliateId(affiliateCode.client_affiliate_id, affiliateTypeId);
      if (!client) {
        return res.notFound(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE');
      }

      affiliateCode.max_references = max_references;
      await affiliateCodeService.update(affiliateCode);

      return res.ok(affiliateCode);
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },
  checkReferenceCode: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body, affiliateTypeId, params } = req;
      let { code } = params;
      code = _.trim(code).toUpperCase();
      logger.info('AffiliateCode::checkReferenceCode', code);

      const affiliateCodeService = Container.get(AffiliateCodeService);
      const clientAffiliateService = Container.get(ClientAffiliateService);
      const affiliateCode = await affiliateCodeService.findByPk(code);
      if (!affiliateCode) {
        return res.notFound(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE');
      }

      let referrerClientAffiliate = await affiliateCode.getOwner();
      if (!referrerClientAffiliate) {
        return res.notFound(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE');
      }

      if (referrerClientAffiliate.affiliate_type_id !== affiliateTypeId) {
        referrerClientAffiliate = await clientAffiliateService.findOne({
          client_id: referrerClientAffiliate.client_id,
          affiliate_type_id: affiliateTypeId,
        });

        if (!referrerClientAffiliate) {
          return res.badRequest(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE', { fields: ['affiliate_code'] });
        }
      }

      const clientService = Container.get(ClientService);
      const membershipTypeService = Container.get(MembershipTypeService);
      const client = await clientService.findByPk(referrerClientAffiliate.client_id);
      const membership_type_id = client.membership_type_id;

      if (!membership_type_id) {
        return res.forbidden(res.__('THE_OWNER_IS_NOT_PAID_MEMBERSHIP_MEMBER'), 'THE_OWNER_IS_NOT_PAID_MEMBERSHIP_MEMBER');
      }

      // Allow silver see self referrer code // NGOC MY 28/10/2020
      // const membershipType = await membershipTypeService.findOne({
      //   id: membership_type_id
      // });

      // if (!membershipType || membershipType.type === MembershipTypeName.Free) {
      //   return res.forbidden(res.__('THE_OWNER_IS_NOT_PAID_MEMBERSHIP_MEMBER'), 'THE_OWNER_IS_NOT_PAID_MEMBERSHIP_MEMBER');
      // }

      return res.ok({ isValid: true });
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },
  clickReferalCode: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body, affiliateTypeId, params } = req;
      let { code } = params;
      code = _.trim(code).toUpperCase();
      logger.info('AffiliateCode::clickReferalCode', code);

      const affiliateCodeService = Container.get(AffiliateCodeService);
      const affiliateCode = await affiliateCodeService.findByPk(code);
      if (!affiliateCode) {
        return res.notFound(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE');
      }

      const affiliateCodeStatisticsService = Container.get(AffiliateCodeStatisticsService);
      const affiliateCodeStatistics = await affiliateCodeStatisticsService.findOrCreate({
        affiliate_code: affiliateCode.code,
      }, {
        affiliate_code: affiliateCode.code,
        num_of_clicks: 0,
        deleted_flg: false,
      });

      affiliateCodeStatistics.num_of_clicks = Number(affiliateCodeStatistics.num_of_clicks) + 1;
      await affiliateCodeStatisticsService.update(affiliateCodeStatistics);

      return res.ok({ num_of_clicks: affiliateCodeStatistics.num_of_clicks });
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },

};

module.exports = controller;
