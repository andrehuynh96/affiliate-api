const config = require('app/config');
const { Container } = require('typedi');
const logger = require('app/lib/logger');
const Partner = require('app/model').partners;
const ClientKey = require('app/model').partner_api_keys;
const jwt = require('jsonwebtoken');
const { AppService, AffiliateTypeService } = require('../../services');

module.exports = async (req, res, next) => {
  try {
    const logger = Container.get('logger');
    const { body } = req;
    const { api_key, secret_key, grant_type } = body;
    const appService = Container.get(AppService);
    const app = await appService.findOne({
      api_key: api_key,
      secret_key: secret_key,
      deleted_flg: false,
    });

    if (!app) {
      return res.badRequest(res.__('NOT_FOUND_API_KEY'), 'NOT_FOUND_API_KEY');
    }

    if (!app.actived_flg) {
      return res.forbidden(res.__('APP_NOT_INACTIVE'), 'APP_NOT_INACTIVE');
    }

    var payload = {
      app_id: app.id,
      api_key: app.api_key
    };
    const token = jwt.sign(payload, config.jwt.private, config.jwt.options);

    return res.ok({
      access_token: token,
      token_type: 'Bearer',
      expires_in: config.jwt.options.expiresIn,
    });

  }
  catch (err) {
    logger.error('Authentication fail:', err);
    next(err);
  }
};
