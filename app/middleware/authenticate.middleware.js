const jwt = require('jsonwebtoken');
const config = require('app/config');
const typedi = require('typedi');
const { KEY } = require('app/constants');
const { AppService, AffiliateTypeService } = require('../services');
const { Container } = require('typedi');

module.exports = function (options) {
  options = options || {};
  const isIgnoredAffiliateTypeId = !!options.isIgnoredAffiliateTypeId;

  return async (req, res, next) => {
    const affiliateTypeId = req.headers['x-affiliate-type-id'];
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    console.log(req.headers['x-time']);

    if (token && (token.startsWith('Bearer ') || token.startsWith('bearer '))) {
      token = token.slice(7, token.length);
    }
    else {
      return res.unauthorized();
    }

    if (token) {
      try {
        var decodedToken = jwt.verify(token, config.jwt.public, config.jwt.options);
        req.appId = decodedToken.app_id;
        req.apiKey = decodedToken.api_key;

        if (isIgnoredAffiliateTypeId) {
          return next();
        }

        // Validate affiliateTypeId
        const redisCacherService = Container.get('redisCacherService');
        const key = redisCacherService.getCacheKey(KEY.getAffiliateTypeIdById, { affiliateTypeId });
        let affiliateType = await redisCacherService.get(key);

        if (!affiliateType) {
          const affiliateTypeService = Container.get(AffiliateTypeService);
          affiliateType = await affiliateTypeService.findByPk(affiliateTypeId);

          if (affiliateType) {
            await redisCacherService.set(key, affiliateType, config.redis.ttlInSeconds);
          }
        }

        if (!affiliateType) {
          return res.unauthorized();
        }

        req.affiliateTypeId = affiliateType.id;
        req.organizationId = affiliateType.organization_id;

        return next();
      } catch (err) {
        // const msg = 'Invalid token - ' + e.message;
        return res.serverInternalError(err);
      }
    }
    return res.badRequest();
  };

};
