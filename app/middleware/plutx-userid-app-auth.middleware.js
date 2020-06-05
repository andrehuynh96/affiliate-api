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
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, (err, data) => {
      if (err) {
        return reject(err);
      }

      console.log(data);
      return resolve(data);
    });
  });
};

const verifyAccessToken = async (req, res, next, options) => {
  logger.log('authenticate.middleware..');
  options = options || {};
  const isIgnoredAffiliateTypeId = !!options.isIgnoredAffiliateTypeId;
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
      const { checkAllScopes, rootOrgUnit, scopes: requiredScopes } = options;
      const userId = decodedToken.sub;
      const user = {
        id: userId,
        scopes: (decodedToken.scope || '').split(' '),
        rootOrgUnit: decodedToken.root_org_unit,
        rootOrgUnitId: decodedToken.root_org_unit_id,
      };
      const organizationId = req.organizationId = decodedToken.organization_id || decodedToken.root_org_unit_id;

      let isAllowed = rootOrgUnit ? _.toUpper(_.trim(user.rootOrgUnit)) === _.toUpper(_.trim(rootOrgUnit)) : true;
      if (isAllowed) {
        if (!requiredScopes || requiredScopes.length === 0) {
          isAllowed = true;
        } else if (checkAllScopes) {
          isAllowed = requiredScopes.every(scope => user.scopes.includes(scope));
        } else {
          isAllowed = requiredScopes.some(scope => user.scopes.includes(scope));
        }
      }

      if (!isAllowed) {
        return res.forbidden(res.__('FORBIDDEN'), 'FORBIDDEN');
      }

      req.user = user;

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

};

module.exports = function (options) {
  return function (req, res, next) {
    verifyAccessToken(req, res, next, options);
  };
};
