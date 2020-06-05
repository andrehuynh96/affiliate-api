const jwt = require('jsonwebtoken');
const _ = require('lodash');
const config = require('app/config');
const typedi = require('typedi');
const { KEY } = require('app/constants');
const logger = require('app/lib/logger');
const { AppService, AffiliateTypeService } = require('../services');
const { Container } = require('typedi');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: `${config.plutxUserID.apiUrl}/.well-known/jwks.json`,
  strictSsl: false,
  requestHeaders: {},
  requestAgentOptions: {},
  cache: true,
  cacheMaxEntries: 5,
  // cacheMaxAge: ms('10h'), // Default value
});

const getKey = (header, callback) => {
  console.log(header);
  const kid = config.plutxUserID.kid;

  client.getSigningKey(kid, function (err, key) {
    const signingKey = key.publicKey || key.rsaPublicKey;

    callback(null, signingKey);
  });
};

const getDecodedToken = (token) => {
  // if (config.plutxUserID.isEnabled) {
  //   return new Promise((resolve, reject) => {
  //     jwt.verify(token, getKey, (err, data) => {
  //       if (err) {
  //         return reject(err);
  //       }

  //       console.log(data);
  //       return resolve(data);
  //     });
  //   });
  // }

  let decodedToken = null;
  try {
    decodedToken = jwt.verify(token, config.jwt.public, config.jwt.options);
    // eslint-disable-next-line no-empty
  } catch (e) { }

  return Promise.resolve(decodedToken);
};

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
      const decodedToken = await getDecodedToken(token);

      if (!decodedToken) {
        return res.unauthorized();
      }

      try {
        req.appId = decodedToken.app_id;
        req.apiKey = decodedToken.api_key;
        const organizationId = req.organizationId = decodedToken.organization_id || decodedToken.root_org_unit_id;

        if (isIgnoredAffiliateTypeId) {
          return next();
        }

        if (!affiliateTypeId) {
          return res.badRequest(res.__('MISSING_AFFILIATE_TYPE_ID'), 'MISSING_AFFILIATE_TYPE_ID');
        }

        // Validate affiliateTypeId
        logger.log('Validate affiliateTypeId', affiliateTypeId, organizationId);
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
