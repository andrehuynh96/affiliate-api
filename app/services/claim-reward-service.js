const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const { forEach } = require('p-iteration');
const BaseService = require('./base-service');
const db = require('app/model');
const ClaimRewardStatus = require('app/model/value-object/claim-reward-status');

const Op = Sequelize.Op;
const Service = typedi.Service;
const sequelize = db.sequelize;
const ClaimReward = db.claim_rewards;

class _ClaimRewardService extends BaseService {

  constructor() {
    super(ClaimReward, 'ClaimReward');
  }

  getTotalAmount(affiliateClientId, currencySymbol, statusList) {
    if (!statusList) {
      statusList = [
        ClaimRewardStatus.Pending,
        ClaimRewardStatus.Approved,
        ClaimRewardStatus.InProcessing,
        ClaimRewardStatus.Completed,
      ];
    }

    return new Promise(async (resolve, reject) => {
      try {
        const cond = {
          where: {
            client_affiliate_id: affiliateClientId,
            currency_symbol: currencySymbol,
            status: {
              [Op.in]: statusList,
            }
          }
        };
        const total = await this.model.sum('amount', cond);

        resolve(total);
      } catch (err) {
        reject(err);
      }
    });
  }

}


const ClaimRewardService = Service([], () => {
  const service = new _ClaimRewardService();

  return service;
});

module.exports = ClaimRewardService;
