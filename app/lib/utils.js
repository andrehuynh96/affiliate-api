const utils = {
  getOsEnv(key) {
    if (typeof process.env[key] === 'undefined') {
      throw new Error(`Environment variable ${key} is not set.`);
    }

    return process.env[key];
  },
  getOsEnvOptional(key) {
    return process.env[key];
  },
  getOsEnvArray(key, delimiter) {
    delimiter = delimiter || ',';

    return process.env[key] && process.env[key].split(delimiter) || [];
  },
  toNumber(value) {
    return value ? parseInt(value, 10) : undefined;
  },
  toBool(value) {
    return value === 'true';
  },
  normalizePort(port) {
    const parsedPort = parseInt(port, 10);
    if (isNaN(parsedPort)) { // named pipe
      return port;
    }

    if (parsedPort >= 0) { // port number
      return parsedPort;
    }

    return false;
  },

};

module.exports = utils;
