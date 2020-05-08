const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('app/config');
const typedi = require('typedi');
const { KEY } = require('app/constants');
const logger = require('app/lib/logger');
const { AppService, AffiliateTypeService } = require('../services');
const { Container } = require('typedi');

module.exports = function (options) {
  options = options || {};
  const isIgnoredAffiliateTypeId = !!options.isIgnoredAffiliateTypeId;

  return async (req, res, next) => {
    logger.log('authenticate.middleware..');

    const affiliateTypeId = _.trim(req.headers['x-affiliate-type-id']);
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (token && (token.startsWith('Bearer ') || token.startsWith('bearer '))) {
      token = token.slice(7, token.length);
    }
    else {
      return res.unauthorized();
    }

    if (token) {
      try {
        const decodedToken = jwt.verify(token, config.jwt.public, config.jwt.options);
        req.appId = decodedToken.app_id;
        req.apiKey = decodedToken.api_key;
        const organizationId = req.organizationId = decodedToken.organization_id;

        if (isIgnoredAffiliateTypeId) {
          return next();
        }

        if (!affiliateTypeId) {
          return res.badRequest(res.__('MISSING_AFFILIATE_TYPE_ID'), 'MISSING_AFFILIATE_TYPE_ID');
        }

        // Validate affiliateTypeId
        logger.log('Validate affiliateTypeId', affiliateTypeId, organizationId );
        const redisCacherService = Container.get('redisCacherService');
        const key = redisCacherService.getCacheKey(KEY.getAffiliateTypeIdByIdAndOrgId, { affiliateTypeId, organizationId });
        let affiliateType = await redisCacherService.get(key);

        if (!affiliateType) {
          logger.log('Get affiliateType from db');

          const affiliateTypeService = Container.get(AffiliateTypeService);
          affiliateType = await affiliateTypeService.findByIdAndOrganizationId(affiliateTypeId, organizationId);

          logger.log('redisCacherService.set(key');
          if (affiliateType) {
            await redisCacherService.set(key, affiliateType, config.redis.ttlInSeconds);
          }
        }

        if (!affiliateType) {
          return res.badRequest(res.__('NOT_FOUND_AFFILIATE_TYPE'), 'NOT_FOUND_AFFILIATE_TYPE');
        }

        req.affiliateTypeId = affiliateType.id;
        req.organizationId = affiliateType.organization_id;

        return next();
      } catch (err) {
        logger.error(err);

        return res.serverInternalError(err);
      }
    }
    return res.badRequest();
  };

};
