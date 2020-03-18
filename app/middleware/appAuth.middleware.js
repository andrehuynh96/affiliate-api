const typedi = require('typedi');
const AppService = require('../services/app-service');

const Container = typedi.Container;

module.exports = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const secretKey = req.headers['x-secret-key'];
  if (!apiKey || !secretKey) {
    return res.unauthorized();
  }

  // Validate app
  const appService = Container.get(AppService);
  const app = await appService.findOne({ api_key: apiKey });
  if (!app) {
    return res.unauthorized();
  }

  console.log(app.secret_key);
  const isValidApp = app.actived_flg && app.secret_key === secretKey;
  if (!isValidApp) {
    return res.unauthorized();
  }

  res._app = app;
  res.affiliateTypeId = app.affiliate_type_id;

  next();
};
