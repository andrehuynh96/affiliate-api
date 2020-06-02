require('rootpath')();
const express = require('express');
const morgan = require('morgan');
const http = require('http');
const typedi = require('typedi');
const database = require('app/lib/database');
const logger = require('app/lib/logger');
const redis = require('app/lib/redis');
const config = require('app/config');
const { RedisCacherService } = require('./app/services');
const startJobs = require('app/jobs');

const { Container, Service } = typedi;

const setupDI = () => {
  Container.set('logger', logger);

  const redisCacherService = Container.get(RedisCacherService);
  redisCacherService.init();

  Container.set('redisCacherService', redisCacherService);
};

setupDI();

const app = express();
app.use(morgan('dev'));

database.init(async err => {
  if (err) {
    logger.error('database start fail:', err);
    return;
  }

  require('app/model');
  database.instanse.sync({ force: false }).then(() => {
    logger.info('Resync data model and do not drop any data');

    logger.info('Sequelize migrations ...');
    const exec = require('child_process').execSync;
    const cmd = 'npx sequelize-cli db:migrate';
    exec(cmd, function (error, stdout, stderr) {
      logger.info('stdout ', stdout);
      logger.info('stderr ', stderr);

      if (error) {
        logger.error(error);
      }
    });

    require('app/model/seed');
  });

  startJobs();

  app.set('trust proxy', 1);
  app.use('/', require('app/index'));
  app.use(express.static('public'));
  app.use(errorHandler);

  const server = http.createServer(app);

  server.listen(config.app.port, config.app.appHostName, function () {
    console.log('=======================================================');
    console.log(`App: ${config.app.name}, version: ${config.app.version}.`);
    console.log('=======================================================');
    console.log(`Listening at http://${config.app.appHostName}:${config.app.port}\n`);
  });

  process.on('SIGINT', () => {
    process.exit(0);
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
