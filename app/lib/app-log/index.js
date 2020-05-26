const logger = require('app/lib/logger');

const appLog = {
  push: (action, params) => {
    logger.info(`[${action}] ${JSON.stringify(params)}`);
  }
};

module.exports = appLog;
