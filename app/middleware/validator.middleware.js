const joi = require('joi');
const logger = require('app/lib/logger');

/*
* type: body, query, params
*/
module.exports = function (schema, type) {
  return function (req, res, next) {
    type = type || 'body';
    const result = joi.validate(req[type], schema);

    if (result.error) {
      const err = {
        details: result.error.details,
      };

      return res.badRequest(res.__('MISSING_PARAMETERS'), 'MISSING_PARAMETERS', err);
    }

    next();
  };
};
