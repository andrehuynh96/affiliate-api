const _ = require('lodash');
const crypto = require('crypto');

/**
 * Abstract cacher class
 *
 * @class BaseCacherService
 */
class BaseCacherService {

	/**
	 * Creates an instance of Cacher.
	 *
	 * @param {object} opts
	 *
	 * @memberof Cacher
	 */
  constructor(opts) {
    this.opts = _.defaultsDeep(opts, {
      ttl: null,
      keygen: null,
      maxParamsLength: null
    });
  }

	/**
	 * Initialize cacher
	 */
  init() {
  }

	/**
	 * Close cacher
	 *
	 * @memberof Cacher
	 */
  close() {
    return Promise.resolve();
  }

	/**
	 * Get a cached content by key
	 *
	 * @param {any} key
	 *
	 * @memberof Cacher
	 */
  get(key) {
    throw new Error('Not implemented method!');
  }

	/**
	 * Get a cached content and ttl by key
	 *
	 * @param {any} key
	 *
	 * @memberof Cacher
	 */
  getWithTTL(key) {
    throw new Error('Not implemented method!');
  }

	/**
	 * Set a content by key to cache
	 *
	 * @param {any} key
	 * @param {any} data
	 * @param {Number?} ttl
	 *
	 * @memberof Cacher
	 */
  set(key, data, ttl) {
    throw new Error('Not implemented method!');
  }

	/**
	 * Delete a content by key from cache
	 *
	 * @param {string|Array<string>} key
	 *
	 * @memberof Cacher
	 */
  del(key) {
    throw new Error('Not implemented method!');
  }

	/**
	 * Clean cache. Remove every key by match
	 * @param {string|Array<string>} match string. Default is "**"
	 * @returns {Promise}
	 *
	 * @memberof Cacher
	 */
  clean(match) {
    throw new Error('Not implemented method!');
  }

	/**
	 * Get a value from params or meta by `key`.
	 * If the key starts with `#` it reads from `meta`, otherwise from `params`.
	 *
	 * @param {String} key
	 * @param {Object} params
	 * @param {Object} meta
	 * @returns {any}
	 * @memberof Cacher
	 */
  getParamMetaValue(key, params, meta) {
    if (key.startsWith('#') && meta != null)
      return _.get(meta, key.slice(1));
    else if (params != null)
      return _.get(params, key);
  }

	/**
	 * Default cache key generator
	 *
	 * @param {String} actionName
	 * @param {Object|null} params
	 * @param {Object} meta
	 * @param {Array|null} keys
	 * @returns {String}
	 * @memberof Cacher
	 */
  defaultKeygen(actionName, params, meta, keys) {
    if (params || meta) {
      const keyPrefix = actionName + ':';
      if (keys) {
        if (keys.length == 1) {
          // Fast solution for ['id'] key
          const val = this.getParamMetaValue(keys[0], params, meta);
          return keyPrefix + this._hashedKey(_.isObject(val) ? this._hashedKey(this._generateKeyFromObject(val)) : val);
        }

        if (keys.length > 0) {
          return keyPrefix + this._hashedKey(keys.reduce((a, key, i) => {
            const val = this.getParamMetaValue(key, params, meta);
            return a + (i ? '|' : '') + (_.isObject(val) || Array.isArray(val) ? this._hashedKey(this._generateKeyFromObject(val)) : val);
          }, ''));
        }
      }
      else {
        return keyPrefix + this._hashedKey(this._generateKeyFromObject(params));
      }
    }
    return actionName;
  }

  _hashedKey(key) {
    const maxParamsLength = this.opts.maxParamsLength;
    if (!maxParamsLength || maxParamsLength < 44 || key.length <= maxParamsLength)
      return key;

    const prefixLength = maxParamsLength - 44;

    const base64Hash = crypto.createHash('sha256').update(key).digest('base64');
    if (prefixLength < 1)
      return base64Hash;

    return key.substring(0, prefixLength) + base64Hash;
  }

  _generateKeyFromObject(obj) {
    if (Array.isArray(obj)) {
      return obj.map(o => this._generateKeyFromObject(o)).join('|');
    }
    else if (_.isObject(obj)) {
      return Object.keys(obj).map(key => [key, this._generateKeyFromObject(obj[key])].join('|')).join('|');
    }
    else if (obj != null) {
      return obj.toString();
    } else {
      return 'null';
    }
  }

	/**
	 * Get a cache key by name and params.
	 * Concatenate the name and the hashed params object
	 *
	 * @param {String} name
	 * @param {Object} params
	 * @param {Object} meta
	 * @param {Array|null} keys
	 * @returns {String}
	 */
  getCacheKey(actionName, params, meta, keys) {
    if (_.isFunction(this.opts.keygen))
      return this.opts.keygen.call(this, actionName, params, meta, keys);
    else
      return this.defaultKeygen(actionName, params, meta, keys);
  }

}

module.exports = BaseCacherService;
