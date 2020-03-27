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

  bulkCreate(items) {
    return new Promise(async (resolve, reject) => {
      try {

        sequelize.transaction(async (t) => {
          const chunks = _.chunk(items, NUM_OF_ITEMS_IN_A_BATCH);

          await forEach(chunks, async (chunk) => {
            await Reward.bulkCreate(chunk, {
              transaction: t,
            });
          });

          return chunks;
        }).then(result => {
          // Transaction has been committed
          resolve(result);
        }).catch(err => {
          // Transaction has been rolled back
          reject(err);
        });
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
