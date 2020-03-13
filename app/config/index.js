/*eslint no-process-env: "off"*/
require('dotenv').config();
const fs = require("fs");
const path = require('path');
const logFolder = process.env.LOG_FOLDER || './public/logs';

const config = {
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
        logging: false
      }
    }
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    prefix: process.env.REDIS_PREFIX || 'affiliate:api:cache',
    usingPass: process.env.REDIS_USING_PASS || 0,
    pass: process.env.REDIS_PASS,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE.toLowerCase() === 'true'
      : false,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    mailSendAs: process.env.MAIL_SEND_AS,
  },
  rateLimit: process.env.RATE_LIMIT ? parseInt(process.env.RATE_LIMIT) : 100,
  jwt: {
    options: {
      issuer: process.env.SIGN_I || "infinito",
      subject: process.env.SIGN_S || "info@infinito.io",
      audience: process.env.SIGN_A || "https://www.infinito.io/",
      expiresIn: process.env.EXPIRESIN ? parseInt(process.env.EXPIRESIN) : 84600,
      algorithm: "RS256" // RSASSA [ "RS256", "RS384", "RS512" ]
    },
    private: fs.readFileSync(path.resolve(__dirname, "../../key/private.key"), "utf8"),
    public: fs.readFileSync(path.resolve(__dirname, "../../key/public.key"), "utf8")
  },
  platform: process.env.PLATFORM ? process.env.PLATFORM.split(",") : ["ATOM"],
  enableSeed: process.env.ENABLE_SEED == "1"
};

module.exports = config;
