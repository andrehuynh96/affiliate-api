const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const baseResponse = require('app/lib/inf-base-response');
const path = require('path');
const config = require('app/config');
const i18n = require('i18n');
const rateLimit = require('express-rate-limit');
const logger = require('app/lib/logger');

i18n.configure({
  locales: ['en', 'vi', 'ja', 'zh', 'ru', 'ko', 'pt'],
  defaultLocale: 'en',
  directory: path.resolve(__dirname + '/locales'),
});
router.use(i18n.init);

router.use(
  bodyParser.urlencoded({
    limit: '5mb',
    extended: true,
  })
);
router.use(
  bodyParser.json({
    limit: '5mb',
    extended: true,
  })
);

if (config.corsDomain) {
  var allowedOrigins = config.corsDomain.split(',');
  router.use(
    cors({
      credentials: true,
      origin: allowedOrigins,
    })
  );
} else {
  router.use(cors());
}

// const limiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: config.app.rateLimit,
// });
// router.use(limiter);

router.use(helmet());
router.use(
  express.json({
    limit: '1mb',
    strict: true,
  })
);

router.use(
  baseResponse({
    i18n: true,
  })
);

router.get('/', function (req, res) {
  const result = {
    message: 'Hello',
    app: config.app.name,
    version: config.app.version,
  };

  res.json(result);
});
router.get('/health', (req, res) => res.send('OK!'));
require('app/config/swagger')(router, '/affiliate-api');
router.use('/.well-known', express.static(path.join(__dirname, 'public')));
router.use('/api', require('app/feature'));

router.use(function (req, res) {
  res.notFound('Not Found');
});

module.exports = router;
