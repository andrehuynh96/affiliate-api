const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const db = require('app/model');
const { AffiliateCodeService, ClientService } = require('../../services');
const mapper = require('app/response-schema/affiliate-code.response-schema');

const Op = Sequelize.Op;
const sequelize = db.sequelize;
const { Container, Service } = typedi;

const controller = {
  getById: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body, affiliateTypeId, params } = req;
      const { affiliateCodeId } = params;
      logger.info('AffiliateCode::getById', affiliateCodeId);

      const affiliateCodeService = Container.get(AffiliateCodeService);
      const cond = {
        code: affiliateCodeId,
        deleted_flg: false,
      };
      const affiliateCode = await affiliateCodeService.findOne(cond);

      if (!affiliateCode) {
        return res.notFound(res.__('AFFILIATE_CODE_IS_NOT_FOUND'), 'AFFILIATE_CODE_IS_NOT_FOUND');
      }

      const clientService = Container.get(ClientService);
      const client = await clientService.findByClientAffiliateId(affiliateCode.client_affiliate_id, affiliateTypeId);
      if (!client) {
        return res.notFound(res.__('AFFILIATE_CODE_IS_NOT_FOUND'), 'AFFILIATE_CODE_IS_NOT_FOUND');
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


};

module.exports = controller;
