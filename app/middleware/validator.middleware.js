const joi = require("joi");
const logger = require("app/lib/logger");

module.exports = function (schema) {
  return function (req, res, next) {
    const result = joi.validate(req.body, schema);
    if (result.error) {
      logger.error(result.error);
      return res.badRequest("Missing parameters");
    } else {
      next();
    }
  };
};
