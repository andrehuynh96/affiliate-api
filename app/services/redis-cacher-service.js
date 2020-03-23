const _ = require('lodash');
const typedi = require('typedi');
const Redis = require('ioredis');
const Redlock = require('redlock');
const BaseCacherService = require('./base-cacher-service');
const config = require('../config');

const { Container, Service } = typedi;


class JSONSerializer {
	/**
	 * Serializer a JS object to Buffer
	 *
	 * @param {Object} obj
	 * @param {String} type of packet
	 * @returns {Buffer}
	 *
	 * @memberof Serializer
	 */
  serialize(obj) {
    return Buffer.from(JSON.stringify(obj));
  }

	/**
	 * Deserialize Buffer to JS object
	 *
	 * @param {Buffer} buf
	 * @param {String} type of packet
	 * @returns {Object}
	 *
	 * @memberof Serializer
	 */
  deserialize(buf) {
    return JSON.parse(buf);
  }
}

class _RedisCacherService extends BaseCacherService {

  constructor(opts) {
    super(opts);

    this.opts = opts;
    this.prefix = this.opts.prefix;

    this.logger = Container.get('logger');
    this.serializer = new JSONSerializer();
  }

	/**
	 * Initialize cacher. Connect to Redis server
	 *
	 * @param {any} broker
	 *
	 * @memberof RedisCacher
	 */
  init() {
    this.logger.info('Setting Redis Cacher');
    this.client = new Redis(this.opts.redis);

    this.client.on('connect', () => {
      this.logger.info('Redis cacher connected.');
    });

    this.client.on('error', (err) => {
      this.logger.error(err);
    });

    const redlockClients = (this.opts.redlock ? this.opts.redlock.clients : null) || [this.client];
    this.redlock = new Redlock(
      redlockClients,
      _.omit(this.opts.redlock, ['clients'])
    );

    // Non-blocking redlock client, used for tryLock()
    this.redlockNonBlocking = new Redlock(
      redlockClients,
      {
        retryCount: 0
      }
    );


    if (this.opts.monitor) {
      /* istanbul ignore next */
      this.client.monitor((err, monitor) => {
        this.logger.debug('Redis cacher entering monitoring mode...');
        monitor.on('monitor', (time, args/* , source, database*/) => {
          this.logger.debug(args);
        });
      });
    }

    this.logger.debug('Redis Cacher created. Prefix: ' + this.prefix);
  }

	/**
	 * Close Redis client connection
	 *
	 * @memberof RedisCacher
	 */
  close() {
    return this.client.quit();
  }

	/**
	 * Get data from cache by key
	 *
	 * @param {any} key
	 * @returns {Promise}
	 *
	 * @memberof Cacher
	 */
  get(key) {
    this.logger.debug(`GET ${key}`);
    return this.client.getBuffer(this.prefix + key).then((data) => {
      if (data) {
        this.logger.debug(`FOUND ${key}`);

        try {
          const res = this.serializer.deserialize(data);
          return res;
        } catch (err) {
          this.logger.error('Redis result parse error.', err, data);
        }
      }

      return null;
    });
  }

	/**
	 * Save data to cache by key
	 *
	 * @param {String} key
	 * @param {any} data JSON object
	 * @param {Number} ttl Optional Time-to-Live
	 * @returns {Promise}
	 *
	 * @memberof Cacher
	 */
  set(key, data, ttl) {
    data = this.serializer.serialize(data);
    this.logger.debug(`SET ${key}`);

    if (ttl == null) {
      ttl = this.opts.ttl;
    }

    let p;
    if (ttl) {
      p = this.client.setex(this.prefix + key, ttl, data);
    } else {
      p = this.client.set(this.prefix + key, data);
    }

    return p
      .then(res => {
        return res;
      })
      .catch(err => {
        throw err;
      });
  }

	/**
	 * Delete a key from cache
	 *
	 * @param {string|Array<string>} deleteTargets
	 * @returns {Promise}
	 *
	 * @memberof Cacher
	 */
  del(deleteTargets) {
    deleteTargets = Array.isArray(deleteTargets) ? deleteTargets : [deleteTargets];
    const keysToDelete = deleteTargets.map(key => this.prefix + key);
    this.logger.debug(`DELETE ${keysToDelete}`);
    return this.client.del(keysToDelete)
      .then(res => {
        return res;
      })
      .catch(err => {
        this.logger.error(`Redis 'del' error. Key: ${keysToDelete}`, err);
        throw err;
      });
  }

	/**
	 * Clean cache. Remove every key by prefix
	 *        http://stackoverflow.com/questions/4006324/how-to-atomically-delete-keys-matching-a-pattern-using-redis
	 * alternative solution:
	 *        https://github.com/cayasso/cacheman-redis/blob/master/lib/index.js#L125
	 * @param {String|Array<String>} match Match string for SCAN. Default is "*"
	 * @returns {Promise}
	 *
	 * @memberof Cacher
	 */
  clean(match = '*') {
    const cleaningPatterns = Array.isArray(match) ? match : [match];
    const normalizedPatterns = cleaningPatterns.map(match => this.prefix + match.replace(/\*\*/g, '*'));
    this.logger.debug(`CLEAN ${match}`);
    return this._sequentialPromises(normalizedPatterns)
      .then(res => {
        return res;
      })
      .catch((err) => {
        this.logger.error(`Redis 'scanDel' error. Pattern: ${err.pattern}`, err);
        throw err;
      });

  }

	/**
	 * Get data and ttl from cache by key.
	 *
	 * @param {string|Array<string>} key
	 * @returns {Promise}
	 *
	 * @memberof RedisCacher
	 */
  getWithTTL(key) {
    return this.client.pipeline().getBuffer(this.prefix + key).ttl(this.prefix + key).exec().then((res) => {
      // eslint-disable-next-line prefer-const
      let [err0, data] = res[0];
      const [err1, ttl] = res[1];

      if (err0) {
        return this.broker.Promise.reject(err0);
      }
      if (err1) {
        return this.broker.Promise.reject(err1);
      }

      if (data) {
        this.logger.debug(`FOUND ${key}`);
        try {
          data = this.serializer.deserialize(data);
        } catch (err) {
          this.logger.error('Redis result parse error.', err, data);
          data = null;
        }
      }
      return { data, ttl };
    });
  }


	/**
	 * Acquire a lock
	 *
	 * @param {string|Array<string>} key
	 * @param {Number} ttl Optional Time-to-Live
	 * @returns {Promise}
	 *
	 * @memberof RedisCacher
	 */
  lock(key, ttl = 15000) {
    key = this.prefix + key + '-lock';
    return this.redlock.lock(key, ttl).then(lock => {
      return () => lock.unlock();
    });
  }

	/**
	 * Try to acquire a lock
	 *
	 * @param {string|Array<string>} key
	 * @param {Number} ttl Optional Time-to-Live
	 * @returns {Promise}
	 *
	 * @memberof RedisCacher
	 */
  tryLock(key, ttl = 15000) {
    key = this.prefix + key + '-lock';
    return this.redlockNonBlocking.lock(key, ttl).then(lock => {
      return () => lock.unlock();
    });
  }

  _sequentialPromises(elements) {
    return elements.reduce((chain, element) => {
      return chain.then(() => this._scanDel(element));
    }, this.broker.Promise.resolve());
  }

  _clusterScanDel(pattern) {
    const scanDelPromises = [];
    const nodes = this.client.nodes();

    nodes.forEach(node => {
      scanDelPromises.push(this._nodeScanDel(node, pattern));
    });

    return this.broker.Promise.all(scanDelPromises);
  }

  _nodeScanDel(node, pattern) {
    return new Promise((resolve, reject) => {
      const stream = node.scanStream({
        match: pattern,
        count: 100
      });

      stream.on('data', (keys = []) => {
        if (!keys.length) {
          return;
        }

        stream.pause();
        node.del(keys)
          .then(() => {
            stream.resume();
          })
          .catch((err) => {
            err.pattern = pattern;
            return reject(err);
          });
      });

      stream.on('error', (err) => {
        this.logger.error(`Error occured while deleting keys '${pattern}' from node.`, err);
        reject(err);
      });

      stream.on('end', () => {
        // End deleting keys from node
        resolve();
      });
    });
  }

  _scanDel(pattern) {
    if (this.client instanceof Redis.Cluster) {
      return this._clusterScanDel(pattern);
    } else {
      return this._nodeScanDel(this.client, pattern);
    }
  }
}

const RedisCacherService = Service([], () => {
  const options = {
    prefix: config.redis.prefix,
    ttl: 30,
    monitor: false,
    // Redis settings
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.pass,
      db: config.redis.db,
    },
  };
  const service = new _RedisCacherService(options);

  return service;
});


module.exports = RedisCacherService;
