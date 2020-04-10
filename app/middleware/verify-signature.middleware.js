const crypto = require('crypto');
const urlMod = require('url');
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
    if (req.method.toUpperCase() === 'GET') {
      return next();
    }

    const checksum = req.get('x-checksum');
    const time = req.get('x-time');
    const { apiKey, originalUrl } = req;
    if (!checksum) {
      return res.badRequest();
    }

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
      return res.badRequest('Wrong checksum.');
    }

    next();
  }
  catch (err) {
    logger.error('verify signature fail:', err);
    return res.badRequest(err.message);
  }
};
