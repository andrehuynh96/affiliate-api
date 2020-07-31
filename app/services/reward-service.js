const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const { forEach } = require('p-iteration');
const BaseService = require('./base-service');
const db = require('app/model');
const Policy = require('app/model').policies;
const Op = Sequelize.Op;
const Service = typedi.Service;
const sequelize = db.sequelize;
const Reward = db.rewards;
const NUM_OF_ITEMS_IN_A_BATCH = 100;

class _RewardService extends BaseService {

  constructor() {
    super(Reward, 'Reward');
  }

  bulkCreate(items, options) {
    options = options || {};

    return new Promise(async (resolve, reject) => {
      try {
        const chunks = _.chunk(items, NUM_OF_ITEMS_IN_A_BATCH);

        await forEach(chunks, async (chunk) => {
          await Reward.bulkCreate(chunk, options);
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

  getTotalAmount(affiliateClientId, currencySymbol, latestId) {
    return new Promise(async (resolve, reject) => {
      try {
        const cond = {
          where: {
            client_affiliate_id: affiliateClientId,
            currency_symbol: currencySymbol,
          }
        };
        if (latestId) {
          cond.where.id = {
            [Op.lte]: latestId,
          };

          cond.where.status = {
            [Op.eq]: null
          };
        }

        const total = await this.model.sum('amount', cond);

        resolve(total);
      } catch (err) {
        reject(err);
      }
    });
  }

  getAvailableAmount(affiliateClientId, currencySymbol, latestId) {
    return new Promise(async (resolve, reject) => {
      try {
        const cond = {
          where: {
            client_affiliate_id: affiliateClientId,
            currency_symbol: currencySymbol,
            id: {
              [Op.lte]: latestId,
            },
            status: {
              [Op.eq]: null
            },
          }
        };

        const total = await this.model.sum('amount', cond);

        resolve(total);
      } catch (err) {
        reject(err);
      }
    });
  }

  getLatestId(affiliateClientId, currencySymbol) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findOne({
          where: {
            client_affiliate_id: affiliateClientId,
            currency_symbol: currencySymbol,
          },
          order: [['id', 'DESC']]
        });

        resolve(result ? Number(result.id) : null);
      } catch (err) {
        reject(err);
      }
    });
  }

  getTotalAmountGroupByLevel(affiliateClientId, currencySymbol, latestId) {
    return new Promise(async (resolve, reject) => {
      try {
        const total = await this.model.findAll({
          where: {
            client_affiliate_id: affiliateClientId,
            currency_symbol: currencySymbol,
            status: { [Op.eq]: null },
            id: {
              [Op.lte]: latestId,
            }
          },
          group: ['level'],
          attributes: ['level', [Sequelize.fn('SUM', Sequelize.col('amount')), 'total']],
          raw: true
        });

        resolve(total);
      } catch (err) {
        reject(err);
      }
    });
  }

  getRewardsAndPolicy (affiliateRequestDetailId) {
    return new Promise(async (resolve, reject) => {
      try {
        const total = await this.model.findAll(
          {
            include: [
              {
                model: Policy,
                as: 'Policy',
                attributes: ['name']
              },
            ],
            where: {
              affiliate_request_detail_id: affiliateRequestDetailId
            },
            order: ['level']
          });

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
