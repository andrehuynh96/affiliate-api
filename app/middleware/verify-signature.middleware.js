const crypto = require('crypto');
const logger = require('app/lib/logger');
const ClientKey = require('app/model').client_keys;
const Redis = require('app/lib/redis').client();
const RedisResourse = require('app/resource/redis');

module.exports = async (req, res, next) => {
  try {
    const signature = req.get('x-signature');
    const time = req.get('x-time');
    const apiKey = req.user.api_key;
    if (!signature) {
      return res.badRequest();
    }

    const key = await _getKey(apiKey);
    const content = `${key.secret}/n${req.method.toUpperCase()}/n${req.url}/n${JSON.stringify(req.body)}/n${time}`;
    const hash = crypto
      .createHash('sha256')
      .update(content)
      .digest('hex');

    if (hash != req.body.checksum) {
      return res.badRequest('Wrong checksum.');
    }

  }
  catch (err) {
    logger.error('verify signature fail:', err);
    return res.badRequest(err.message);
  }
};

async function _getKey(apiKey) {
  const cacheKey = RedisResourse.clientKey.withParams(apiKey);
  const cacheData = await Redis.getAsync(cacheKey);
  if (cacheData) {
    return JSON.parse(cacheData);
  }

  const key = await ClientKey.findOne({
    where: {
      client_key: apiKey
    }
  });

  if (key) {
    Redis.setAsync(cacheKey, JSON.stringify(key), 'EX', 3600);
    return key;
  }
  else {
    throw new Error('Not found API Key');
  }
}
