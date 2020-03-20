const utils = require('app/lib/utils');

const logFolder = process.env.LOG_FOLDER || './public/logs';

const config = {
  node: process.env.NODE_ENV,
  envName: process.env.NODE_ENV,
  isProduction: process.env.PRODUCTION === 'true',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',
  app: {
    name: utils.getOsEnv('APP_NAME'),
    appHostName: utils.getOsEnv('APP_HOST_NAME'),
    port: utils.normalizePort(utils.getOsEnvOptional('PORT') || utils.getOsEnv('APP_PORT')),
    rateLimit: process.env.RATE_LIMIT ? parseInt(process.env.RATE_LIMIT) : 100,
  },
  logger: {
    console: {
      enable: true,
      level: 'debug',
    },
    defaultLevel: 'debug',
    file: {
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
    enableSeed: process.env.ENABLE_SEED === '1',
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    prefix: process.env.REDIS_PREFIX || 'affiliate:api:cache',
    usingPass: process.env.REDIS_USING_PASS || 0,
    pass: process.env.REDIS_PASS,
  },
  bull: {
    host: utils.getOsEnv('BULL_REDIS_HOST'),
    port: utils.toNumber(utils.getOsEnv('BULL_REDIS_PORT')),
    password: utils.getOsEnv('BULL_REDIS_PASSWORD'),
    db: utils.toNumber(utils.getOsEnv('BULL_REDIS_DB')),
  },

};

module.exports = config;
