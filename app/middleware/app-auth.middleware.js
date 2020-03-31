const typedi = require('typedi');
const { AppService, AffiliateTypeService } = require('../services');

const { Container } = typedi;

module.exports = function (options) {
  options = options || {};
  const isIgnoredAffiliateTypeId = !!options.isIgnoredAffiliateTypeId;

  return async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const secretKey = req.headers['x-secret-key'];
    const affiliateTypeId = req.headers['x-affiliate-type-id'];

    if (!apiKey || !secretKey) {
      return res.unauthorized();
    }

    // Validate app
    const appService = Container.get(AppService);
    const app = await appService.findOne({
      api_key: apiKey,
      secret_key: secretKey,
      actived_flg: true,
      deleted_flg: false,
    });

    if (!app) {
      return res.unauthorized();
    }

    if (isIgnoredAffiliateTypeId) {
      return next();
    }

    // Validate affiliateTypeId
    const affiliateTypeService = Container.get(AffiliateTypeService);
    const affiliateType = await affiliateTypeService.findByPk(affiliateTypeId);
    if (!affiliateType) {
      return res.unauthorized();
    }

    req.affiliateTypeId = affiliateType.id;
    req.organizationId = affiliateType.organization_id;

    next();
  };
};
