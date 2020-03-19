require('rootpath')();
const express = require('express');
const morgan = require('morgan');
const http = require('http');
const database = require('app/lib/database');
const logger = require('app/lib/logger');
const redis = require('app/lib/redis');
const config = require('app/config');

const app = express();
app.use(morgan('dev'));

database.init(async err => {
  if (err) {
    logger.error('database start fail:', err);
    return;
  }

  redis.init(async err => {
    if (err) {
      logger.error('Redis start fail:', err);
      return;
    }
    require('app/model');
    database.instanse.sync({ force: false }).then(() => {
      logger.info('Resync data model and do not drop any data');
      require('app/model/seed');
    });

    app.set('trust proxy', 1);
    app.use('/', require('app/index'));
    app.use(express.static('public'));
    app.use(errorHandler);

    const server = http.createServer(app);

    server.listen(config.app.port, config.app.appHostName, function () {
      console.log(`Server start successfully on port: ${process.env.APP_PORT}`);
    });

    process.on('SIGINT', () => {
      if (redis) {
        redis.quit();
      }

      process.exit(0);
    });
  });
});

process.on('unhandledRejection', function (reason, p) {
  logger.error('unhandledRejection', reason, p);
});

process.on('uncaughtException', err => {
  logger.error('uncaughtException', err);
});

function errorHandler(err, req, res, next) {
  const isProduction = config.isProduction;
  const status = err.status || err.statusCode || err.httpCode || 500;

  const body = {
    status,
    message: err.message || 'Oops, something went wrong.',
    errors: err.errors,
    trace: (status === 500 && !isProduction) ? err.trace || err.stack : undefined,
  };

  if (config.isProduction) {
    logger.error(`${err.name}.`, err.message);
  } else {
    logger.error(`${err.name}.o`, err, err.trace);
  }

  res.status(status);
  res.json(body);

}
