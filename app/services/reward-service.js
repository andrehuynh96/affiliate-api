const typedi = require('typedi');
const _ = require('lodash');
const moment = require('moment');
const Sequelize = require('sequelize');
const { forEach } = require('p-iteration');
const microprofiler = require('microprofiler');
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
          where: {
            client_affiliate_id: affiliateClientId,
          },
          attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('currency_symbol')), 'currency_symbol']],
          raw: true,
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
          attributes: ['id'],
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

  getTotalAmountByAffiliateClientId(affiliateClientId, latestIdCache) {
    return new Promise(async (resolve, reject) => {
      try {
        const startDate = new Date();
        const orConditions = [];
        Object.keys(latestIdCache).forEach((currencySymbol) => {
          const latestId = latestIdCache[currencySymbol];
          const cond = {
            currency_symbol: currencySymbol,
            id: {
              [Op.lte]: latestIdCache[currencySymbol],
            }
          };
          if (latestId > 0) {
            cond.id = {
              [Op.lte]: latestIdCache[currencySymbol],
            };
          }

          orConditions.push(cond);
        });

        const total = await this.model.findAll({
          where: {
            client_affiliate_id: affiliateClientId,
            status: { [Op.eq]: null },
            [Op.or]: orConditions,
          },
          group: ['currency_symbol', 'level'],
          attributes: ['currency_symbol', 'level', [Sequelize.fn('SUM', Sequelize.col('amount')), 'total']],
          raw: true
        });
        const endDate = new Date();
        var diffMS = endDate - startDate;
        console.log(`Run getTotalAmountByAffiliateClientId in ${diffMS}  ms.`);

        resolve(total);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }


  getRewardsAndPolicy(affiliateRequestDetailId) {
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
