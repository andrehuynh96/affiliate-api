const jwt = require("jsonwebtoken");
const config = require("app/config");

module.exports = function (req, res, next) {
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  if (token && (token.startsWith("Bearer ") || token.startsWith("bearer "))) {
    token = token.slice(7, token.length);
  }
  else {
    return res.unauthorized();
  }

  if (token) {
    try {
      var legit = jwt.verify(token, config.jwt.public, config.jwt.options);
      req.user = legit;
      return next();
    } catch (err) {
      return res.serverInternalError(err);
    }
  }
  return res.badRequest();
};
