const config = require('app/config');

module.exports = async function (req, res, next) {
  if (config.disableRecaptcha) return next();
  if (!req.recaptcha.error) {
    next()
  } else {
    return res.failure('Invalid Recaptcha', 400);
  }
}; 