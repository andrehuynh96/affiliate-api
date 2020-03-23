const config = require('app/config');
const log4js = require('log4js');

const logLayout = {
  type: 'pattern',
  // pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} %p %z %c %m'
  pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} %p %z %m'
};

log4js.configure({
  pm2: true,
  appenders: {
    FILE: {
      type: 'dateFile',
      filename: config.logger.file.app,
      pattern: config.logger.file.format,
      level: config.logger.file.level,
      layout: logLayout,
      compress: config.logger.file.compress,
      daysToKeep: 90
    },
    CONSOLE: {
      type: 'console',
      layout: logLayout,
      level: config.logger.console.level,
    },
    FILE_ERROR: {
      type: 'dateFile',
      filename: config.logger.file.error,
      pattern: config.logger.file.format,
      level: process.env.LOG_FILE_ERROR || 'trace',
      layout: logLayout,
      compress: config.logger.file.compress,
      daysToKeep: 90
    },
    ERROR_ONLY: {
      type: 'logLevelFilter',
      appender: 'FILE_ERROR',
      level: 'error'
    }
  },
  categories: {
    default: {
      appenders: config.logger.appenders,
      level: config.logger.defaultLevel
    }
  }
});
const instance = log4js.getLogger('Logger');

module.exports = instance;
