const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const db = require('app/model');
const {
  AffiliateCodeService,
  ClientService,
  ClientAffiliateService,
  AffiliateTypeService,
} = require('app/services');
const mapper = require('app/response-schema/affiliate-code.response-schema');
const { policyHelper, clientHelper } = require('app/lib/helpers');
const PolicyType = require('app/model/value-object/policy-type');

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
      const affiliateCode = await affiliateCodeService.findByPk(code);
      if (!affiliateCode) {
        return res.notFound(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE');
      }

      const referrerClientAffiliate = await affiliateCode.getOwner();
      if (!referrerClientAffiliate) {
        return res.notFound(res.__('NOT_FOUND_REFERRER_USER'), 'NOT_FOUND_REFERRER_USER');
      }

      if (referrerClientAffiliate.affiliate_type_id !== affiliateTypeId) {
        return res.badRequest(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE', { fields: ['code'] });
      }

      const clientAffiliateService = Container.get(ClientAffiliateService);
      const clientService = Container.get(ClientService);
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

      return res.ok(true);
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },

};

module.exports = controller;
