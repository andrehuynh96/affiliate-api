const _ = require('lodash');
const crypto = require('crypto');
const urlMod = require('url');
const moment = require('moment');
const logger = require('app/lib/logger');
const config = require('app/config');
const { KEY } = require('app/constants');
const { Container } = require('typedi');
const { AppService, AffiliateTypeService } = require('../services');

const getApp = async (apiKey) => {
  if (!apiKey) {
    return null;
  }

  const redisCacherService = Container.get('redisCacherService');
  const key = redisCacherService.getCacheKey(KEY.getAppByApiKey, { apiKey });
  let result = await redisCacherService.get(key);
  if (result) {
    return result;
  }

  const appService = Container.get(AppService);
  result = await appService.findOne({
    api_key: apiKey,
    deleted_flg: false,
  });

  if (result) {
    await redisCacherService.set(key, result, config.redis.ttlInSeconds);
  }

  return result;
};

module.exports = async (req, res, next) => {
  try {
    if (!config.signature.isEnabled) {
      return next();
    }

    if (req.method.toUpperCase() === 'GET') {
      return next();
    }

    const checksum = _.trim(req.get('x-checksum'));
    const time = _.trim(req.get('x-time'));
    if (!checksum) {
      return res.badRequest(res.__('NOT_FOUND_CHECK_SUM'), 'NOT_FOUND_CHECK_SUM');
    }
    if (!time) {
      return res.badRequest(res.__('NOT_FOUND_X_TIME'), 'NOT_FOUND_X_TIME');
    }

    // UTC date
    const signedDate = moment.unix(time);
    const now = moment.utc();
    if (now.diff(signedDate, 'seconds') > config.signature.expiresIn) {
      return res.badRequest(res.__('X_TIME_IS_OLD'), 'X_TIME_IS_OLD');
    }

    const { apiKey, originalUrl } = req;
    const app = await getApp(apiKey);
    if (!app) {
      return res.badRequest(res.__('NOT_FOUND_API_KEY'), 'NOT_FOUND_API_KEY');
    }

    const signedUrl = originalUrl;
    const content = `${app.secret_key}\n${req.method.toUpperCase()}\n${signedUrl}\n${JSON.stringify(req.body)}\n${time}`;
    const hash = crypto
      .createHash('sha256')
      .update(content)
      .digest('hex');

    if (hash != checksum) {
      // FOR DEBUGING
      if (config.signature.showChecksum) {
        logger.info('SignedUrl: ', signedUrl, 'body: ', JSON.stringify(req.body));
        logger.info('Wrong checksum. Time: ', moment.utc().unix(), 'checksum: ', hash);
      }

      return res.badRequest('Wrong checksum.');
    }

    next();
  }
  catch (err) {
    logger.error('verify signature fail:', err);
    return res.badRequest(err.message);
  }
};
