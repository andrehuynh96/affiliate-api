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

      const ext_client_id = client.ext_client_id;
      const result = Object.assign({}, affiliateCode.get({ plain: true }), { ext_client_id });

      return res.ok(mapper(result));
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
        return res.ok({ isValid: false });
      }
      const membershipType = await membershipTypeService.findOne({
        where: {
          id: membership_type_id
        }
      });
      if (!membership_type_id || membershipType.type === MembershipTypeName.Free) {
        return res.ok({ isValid: false });
      }


      /*
      const affiliateTypeService = Container.get(AffiliateTypeService);
      const rootClientAffiliateId = referrerClientAffiliate.root_client_affiliate_id || referrerClientAffiliate.id;

      // Check max level that policy can set for users
      const { policies } = await policyHelper.getPolicies({
        affiliateTypeId,
        clientAffiliateService,
        affiliateTypeService,
        clientAffiliate: referrerClientAffiliate
      });

      if (!_.some(policies)) {
        return res.notFound(res.__('NOT_FOUND_POLICY'), 'NOT_FOUND_POLICY');
      }

      const affiliatePolicy = policies.find(x => x.type === PolicyType.AFFILIATE);
      if (!affiliatePolicy) {
        return res.notFound(res.__('NOT_FOUND_POLICY'), 'NOT_FOUND_POLICY');
      }

      const level = referrerClientAffiliate.level + 1;
      const maxLevels = affiliatePolicy.max_levels;

      if (maxLevels && level > maxLevels) {
        const errorMessage = res.__('POLICY_LEVEL_IS_EXCEED', maxLevels);

        return res.forbidden(errorMessage, 'POLICY_LEVEL_IS_EXCEED', { fields: ['code'] });
      }
      */

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
