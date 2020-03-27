// import Container, { Service } from 'typedi';
// import { env } from '../../env';
// import { LoggerInstance } from 'moleculer';
// import containerHelper from './container-helper';
const typedi = require('typedi');
const _ = require('lodash');
const Redis = require('ioredis');
const Redlock = require('redlock');
const { forEach } = require('p-iteration');
const config = require('../config');

const { Container, Service } = typedi;

class _LockService {

  constructor(opts) {
    this.opts = opts;

    this.logger = Container.get('logger');

    this._createRedisConnection();
  }

  lockRessource(ressourceId, ttl) {
    return new Promise(async (resolve, reject) => {
      this.redlock.lock(ressourceId, ttl)
        .then((lock) => {
          resolve(lock);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  extendLock(lock, ttl) {
    return new Promise(async (resolve, reject) => {
      lock.extend(ttl)
        .then((lock) => {
          resolve(lock);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  unlockLock(lock) {
    return new Promise(async (resolve, reject) => {
      lock.unlock()
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  _createRedisConnection() {
    const logger = this.logger;
    const client = this.client = new Redis(this.opts.redis);

    this.redlock = new Redlock(
      [client],
      {
        driftFactor: 0.01,
        retryCount: 15,
        retryDelay: 200,
      }
    );

    client.on('connect', () => {
      logger.debug('Redis default connection open to ' + this.opts.redis.host + ':' + this.opts.redis.port);
    });

    client.on('error', err => {
      logger.debug('Redis default connection error ' + err);
    });

    this.redlock.on('clientError', err => {
      logger.debug('A Redis Error Has Occurred : ' + err);
    });

    process.on('SIGINT', () => {
      client.quit();
      logger.debug('Redis default connection disconnected');
    });
  }

}

let lockServiceInstance = null;

const LockService = Service([], () => {
  if (lockServiceInstance) {
    return lockServiceInstance;
  }

  const options = {
    prefix: config.redis.prefix,
    ttl: 30,
    monitor: false,
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.pass,
      db: config.redis.db,
    },
  };

  lockServiceInstance = new _LockService(options);

  return lockServiceInstance;
});

module.exports = LockService;

