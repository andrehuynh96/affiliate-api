const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const utils = require('app/lib/utils');
const pkg = require('../../package.json');

const logFolder = process.env.LOG_FOLDER || './public/logs';

const config = {
  node: process.env.NODE_ENV,
  envName: process.env.NODE_ENV,
  isProduction: process.env.PRODUCTION === 'true',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',
  enableDocsLink: process.env.ENABLE_DOCS_LINK === '1',
  app: {
    name: utils.getOsEnv('APP_NAME'),
    version: pkg.version,
    description: pkg.description,
    buildNumber: process.env.BUILD_NUMBER || '',
    appHostName: utils.getOsEnv('APP_HOST_NAME'),
    port: utils.normalizePort(utils.getOsEnvOptional('PORT') || utils.getOsEnv('APP_PORT')),
    rateLimit: utils.toNumber(process.env.RATE_LIMIT || 100),
    pageSize: utils.toNumber(process.env.APP_PAGE_SIZE || 10),
    lockTimeInSeconds: utils.toNumber(process.env.APP_CLAIM_REWARD_LOCK_TIME_IN_SECONDS || 15),
  },
  logger: {
    defaultLevel: process.env.LOG_DEFAULT_LEVEL || 'debug',
    console: {
      enable: true,
      level: process.env.LOG_CONSOLE_LEVEL || 'debug',
    },
    file: {
      level: process.env.LOG_CONSOLE_LEVEL || 'info',
      compress: false,
      app: `${logFolder}/app.log`,
      error: `${logFolder}/error.log`,
      access: `${logFolder}/access.log`,
      format: '.yyyy-MM-dd',
    },
    appenders: ['CONSOLE', 'FILE', 'ERROR_ONLY'],
  },
  db: {
    postpres: {
      database: process.env.POSTPRES_DB_NAME,
      username: process.env.POSTPRES_DB_USER,
      password: process.env.POSTPRES_DB_PASS,
      options: {
        host: process.env.POSTPRES_DB_HOST,
        port: process.env.POSTPRES_DB_PORT,
        dialect: 'postgres',
        logging: process.env.POSTPRES_DEBUG === 'true',
      }
    },
    enableSeed: process.env.ENABLE_SEED === '1' || process.env.ENABLE_SEED === 'true',
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    prefix: process.env.REDIS_PREFIX || 'affiliate:api:cache',
    pass: process.env.REDIS_PASS,
    db: utils.toNumber(utils.getOsEnvOptional('REDIS_CACHE_DB') || '1'),
    ttlInSeconds: 2 * 60,
  },
  bull: {
    host: utils.getOsEnv('BULL_REDIS_HOST'),
    port: utils.toNumber(utils.getOsEnv('BULL_REDIS_PORT')),
    password: utils.getOsEnv('BULL_REDIS_PASSWORD'),
    db: utils.toNumber(utils.getOsEnv('BULL_REDIS_DB')),
  },
  jwt: {
    options: {
      issuer: process.env.JWT_SIGN_ISSUER,
      subject: process.env.JWT_SIGN_SUBJECT,
      audience: process.env.JWT_SIGN_AUDIENCE,
      // time in seconds
      expiresIn: utils.toNumber(process.env.JWT_EXPIRES_IN),
      algorithm: 'RS256',
    },
    public: fs.readFileSync(path.resolve(__dirname, process.env.JWT_PUBLIC_KEY_FILE), 'utf8'),
    private: fs.readFileSync(path.resolve(__dirname, process.env.JWT_PRIVATE_KEY_FILE), 'utf8'),
  },
  signature: {
    isEnabled: process.env.SIGNATURE_IS_ENABLED === 'true',
    expiresIn: utils.toNumber(process.env.SIGNATURE_EXPIRES_IN),
    showChecksum: process.env.SIGNATURE_SHOW_CHECKSUM === 'true',
  },
  plutxUserID: {
    isEnabled: process.env.PLUTX_USERID_IS_ENABLED === 'true',
    appName: process.env.PLUTX_USERID_APP_NAME,
    kid: process.env.PLUTX_USERID_KID,
    apiUrl: process.env.PLUTX_USERID_API_URL,
    apiKey: process.env.PLUTX_USERID_APP_API_KEY,
    secretKey: process.env.PLUTX_USERID_APP_SECRET_KEY,
  },
  affiliate: {
    maxLevels: utils.toNumber(process.env.AFFILIATE_MAX_LEVELS),
    numOfRefferalStructures: utils.toNumber(process.env.AFFILIATE_NUM_OF_REFFERAL_STRUCTURES),
    defaultCurrencyList: (process.env.AFFILIATE_DEFAULT_CURRENCY_LIST || '').split(',').map(x => _.trim(x)),
  },
  membership: {
    defaultCurrencyList: (process.env.MEMBERSHIP_DEFAULT_CURRENCY_LIST || '').split(',').map(x => _.trim(x)),
  },
  patchData: {
    isEnabledSyncClientForMembershipNetwork: process.env.PATCH_IS_ENABLED_SYNC_CLIENT_FOR_MEMBERSHIP_NETWORK === 'true',
    isEnabledUpdateMembershipTreeChart: process.env.PATCH_IS_ENABLED_UPDATE_MEMBERSHIP_TREE_CHART === 'true',
  },
};

console.log('=======================================================');
console.log(` ${config.app.name} version: ${config.app.version}. Build #${config.app.buildNumber} ${config.app.description}`);
console.log('=======================================================');

module.exports = config;
