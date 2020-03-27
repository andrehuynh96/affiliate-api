const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const { forEach } = require('p-iteration');
const BaseService = require('./base-service');
const db = require('app/model');

const Op = Sequelize.Op;
const Service = typedi.Service;
const sequelize = db.sequelize;
const AffiliateRequest = db.affiliate_requests;
const AffiliateRequestDetails = db.affiliate_request_details;
const NUM_OF_ITEMS_IN_A_BATCH = 100;

class _AffiliateRequestService extends BaseService {

  constructor() {
    super(AffiliateRequest, 'AffiliateRequest');
  }

  create(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const details = data.details;
        delete data.details;

        sequelize.transaction(async (t) => {
          const affiliateRequest = await this.model.create(data, {
            transaction: t,
          });

          details.forEach((item) => {
            item.affiliate_request_id = affiliateRequest.id;
          });

          const chunks = _.chunk(details, NUM_OF_ITEMS_IN_A_BATCH);
          await forEach(chunks, async (chunk) => {
            await AffiliateRequestDetails.bulkCreate(details, {
              transaction: t,
            });
          });

          return affiliateRequest;
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

  hasDuplicate(currencySymbol, affiliateTypeId, fromDate, toDate) {
    return new Promise(async (resolve, reject) => {
      try {
        const cond = {
          [Op.and]: [
            {
              currency_symbol: currencySymbol,
              affiliate_type_id: affiliateTypeId,
            },
            {
              to_date: {
                [Op.gte]: fromDate,
              },
            },
          ]
        };
        const result = await this.count(cond);

        resolve(result > 0);
      } catch (err) {
        reject(err);
      }
    });
  }

  getDetails(affiliateRequestId, affiliateRequestDetailsStatusList) {
    return new Promise(async (resolve, reject) => {
      try {
        const cond = {
          where: {
            affiliate_request_id: affiliateRequestId,
          },
          order: [
            ['created_at', 'ASC'],
          ],
        };

        if (affiliateRequestDetailsStatusList) {
          cond.where.status = {
            [Op.in]: affiliateRequestDetailsStatusList
          };
        }

        const result = await AffiliateRequestDetails.findAll(cond);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  setRequestDetailsStatus(id, status, transaction) {
    return new Promise(async (resolve, reject) => {
      try {

        const result = await AffiliateRequestDetails.update(
          {
            status,
          }, {
          where: {
            id,
          },
          transaction: transaction,
          returning: true
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

}


const AffiliateRequestService = Service([], () => {
  const service = new _AffiliateRequestService();

  return service;
});

module.exports = AffiliateRequestService;
