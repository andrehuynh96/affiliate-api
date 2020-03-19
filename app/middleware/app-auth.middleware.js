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
  const app = await appService.findOne({
    api_key: apiKey,
    secret_key: secretKey,
    actived_flg: true,
  });

  if (!app) {
    return res.unauthorized();
  }

  req.affiliateTypeId = app.affiliate_type_id;

  next();
};
