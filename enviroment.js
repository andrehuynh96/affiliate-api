const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

/**
 * Load .env file or for tests the .env.test file.
 */
const ENV_NAME = (process.env.ENV_NAME || 'production').toLowerCase();
const dotenvPath = path.join(__dirname);

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
  `${dotenvPath}/.env.local`,
  `${dotenvPath}/.env.${ENV_NAME}`,
  `${dotenvPath}/.env`,
];

dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    dotenvExpand(
      dotenv.config({
        path: dotenvFile,
      })
    );
  }
});
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('Running App in environment: ' + ENV_NAME);
console.log('NODE_ENV: ' + NODE_ENV);
