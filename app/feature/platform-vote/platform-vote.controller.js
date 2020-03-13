const logger = require("app/lib/logger");
const config = require("app/config");
const PlatformVote = require("app/model").staking_platforms;
const StakingPlatformStatus = require("app/model/value-object/staking-platform-status");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Model = require("app/model");

const ModelConfig = {
  ATOM: Model.cosmos_cfgs,
  IRIS: Model.iris_cfgs
}

module.exports = async (req, res, next) => {
  try {
    let items = await PlatformVote.findAll({
      where: {
        status: {
          [Op.in]: [StakingPlatformStatus.COMMING_SOON, StakingPlatformStatus.ENABLED]
        }
      },
      raw: true
    });
    if (items && items.length > 0) {
      for (let e of items) {
        if (!e.validator_address && ModelConfig[e.symbol]) {
          let validator = await ModelConfig[e.symbol].findOne({
            where: {
              actived_flg: true
            },
            order: [
              ['default_flg', 'DESC'],
            ],
          });
          if (validator) {
            e.validator_address = validator.validator;
          }
        }
      }
    }
    return res.ok(items);
  }
  catch (err) {
    logger.error("get platform vote fail:", err);
    next(err);
  }
}

