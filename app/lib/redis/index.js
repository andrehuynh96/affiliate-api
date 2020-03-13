const redis = require('redis');
const config = require('app/config');
const Promise = require('bluebird');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
let client = null;

const cache = {
  client: () => {
    if (!client) {
      client = cache.init();
    }
    return client;
  },

  init: (callBack) => {
    client = redis.createClient({
      host: config.redis.host,
      port: config.redis.port
    });
    if (config.redis.usingPass == "1") {
      client.auth(config.redis.pass);
    }

    client.on("connect", function () {
      console.log("Redis cache connected sucessfully");
      if (callBack) {
        callBack();
        callBack = null;
      }
    });

    client.on('error', (err) => {
      if (callBack) {
        callBack(err, null);
        callBack = null;
      }
    });
    client.on('end', (err) => {
      if (callBack) {
        callBack(err, null);
        callBack = null;
      }
    });
  },

  quit: () => {
    if (!client) {
      client.quit();
    }
  }
}

module.exports = cache;