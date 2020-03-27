const joi = require('joi');
const logger = require('app/lib/logger');

module.exports = function (schema) {
  return function (req, res, next) {
    const result = joi.validate(req.body, schema);

    if (result.error) {
      logger.debug(result.error);
      const err = {
        details: result.error.details,
      };

      return res.badRequest('Bad Request', '', err);
    }

    next();
  };
};
