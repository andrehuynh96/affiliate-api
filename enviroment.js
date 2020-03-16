const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

/**
 * Load .env file or for tests the .env.test file.
 */
const ENV_NAME = (process.env.ENV_NAME || 'production').toLowerCase();
const dotenvPath = path.join(__dirname);

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
  `${dotenvPath}/.env.${ENV_NAME}`,
  `${dotenvPath}/.env.${ENV_NAME}.local`,
];

dotenv.config();
dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    const envConfig = dotenv.parse(fs.readFileSync(dotenvFile));

    for (const k in envConfig) {
      process.env[k] = envConfig[k];
    }
  }
});

const NODE_ENV = process.env.NODE_ENV || 'development';

process.env.NODE_ENV = NODE_ENV;
console.log('Running App version: ' + ENV_NAME);
console.log('NODE_ENV: ' + NODE_ENV);
