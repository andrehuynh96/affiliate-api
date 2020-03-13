const config = require("app/config");
const log4js = require("log4js");

const logLayout = {
  type: "pattern",
  pattern: "%d{yyyy-MM-dd hh:mm:ss.SSS} %p %z %c %m"
};

log4js.configure({
  pm2: true,
  appenders: {
    FILE: {
      type: "dateFile",
      filename: config.logger.file.app,
      pattern: config.logger.file.format,
      level: "trace",
      layout: logLayout,
      compress: config.logger.file.compress,
      daysToKeep: 90
    },
    CONSOLE: {
      type: "stdout",
      layout: logLayout,
      level: "trace"
    },
    FILE_ERROR: {
      type: "dateFile",
      filename: config.logger.file.error,
      pattern: config.logger.file.format,
      level: "trace",
      layout: logLayout,
      compress: config.logger.file.compress,
      daysToKeep: 90
    },
    ERROR_ONLY: {
      type: "logLevelFilter",
      appender: "FILE_ERROR",
      level: "error"
    }
  },
  categories: {
    default: {
      appenders: config.logger.appenders,
      level: config.logger.defaultLevel
    }
  }
});
const instance = log4js.getLogger("Logger");

module.exports = instance;
