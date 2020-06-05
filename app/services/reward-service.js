const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const { forEach } = require('p-iteration');
const BaseService = require('./base-service');
const db = require('app/model');

const Op = Sequelize.Op;
const Service = typedi.Service;
const sequelize = db.sequelize;
const Reward = db.rewards;
const NUM_OF_ITEMS_IN_A_BATCH = 100;

class _RewardService extends BaseService {

  constructor() {
    super(Reward, 'Reward');
  }

  bulkCreate(items, transaction) {
    return new Promise(async (resolve, reject) => {
      try {
        const chunks = _.chunk(items, NUM_OF_ITEMS_IN_A_BATCH);

        await forEach(chunks, async (chunk) => {
          await Reward.bulkCreate(chunk, {
            transaction: transaction,
          });
        });

        resolve(chunks);
      } catch (err) {
        reject(err);
      }
    });
  }

  getCurrencyListForAffiliateClient(affiliateClientId) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findAll({
          group: ['client_affiliate_id', 'currency_symbol'],
          attributes: ['currency_symbol'],
          where: {
            client_affiliate_id: affiliateClientId,
          }
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });

  }

  getTotalAmount(affiliateClientId, currencySymbol) {
    return new Promise(async (resolve, reject) => {
      try {
        const cond = {
          where: {
            client_affiliate_id: affiliateClientId,
            currency_symbol: currencySymbol,
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


const RewardService = Service([], () => {
  const service = new _RewardService();

  return service;
});

module.exports = RewardService;
