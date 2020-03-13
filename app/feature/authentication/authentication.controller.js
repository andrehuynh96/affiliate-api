const config = require("app/config");
const logger = require("app/lib/logger");
const Partner = require("app/model").partners;
const ClientKey = require("app/model").partner_api_keys;
const ApiKeyStatus = require("app/model/value-object/api-key-status");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    let key = await ClientKey.findOne({
      where: {
        api_key: req.body.api_key,
        secret_key: req.body.secret_key,
        actived_flg: true
      }
    });

    if (!key) {
      return res.badRequest(res.__("NOT_FOUND_API_KEY"), "NOT_FOUND_API_KEY");
    }

    let client = await Partner.findOne({
      where: {
        id: key.partner_id,
      }
    });
    if (!client) {
      return res.badRequest(res.__("NOT_FOUND_CLIENT"), "NOT_FOUND_CLIENT");
    }
    if (!client.actived_flg) {
      return res.forbidden(res.__("CLIENT_NOT_INACTIVE"), "CLIENT_NOT_INACTIVE");
    }

    var payload = {
      client_id: client.id,
      api_key: key.api_key
    };
    let token = jwt.sign(payload, config.jwt.private, config.jwt.options);

    await ClientKey.update({
      status: ApiKeyStatus.CONNECTED
    },
      {
        where: {
          id: key.id
        }, returning: true
      });

    return res.ok({
      access_token: token,
      token_type: 'Bearer',
      expires_in: config.jwt.options.expiresIn
    });

  }
  catch (err) {
    logger.error("Authentication fail:", err);
    next(err);
  }
}