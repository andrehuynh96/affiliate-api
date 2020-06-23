const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const { forEach } = require('p-iteration');
const BaseService = require('./base-service');
const db = require('app/model').sequelize;
const AffiliateRequest = require('app/model').affiliate_requests;
const AffiliateRequestDetails = require('app/model').affiliate_request_details;

const Op = Sequelize.Op;
const Service = typedi.Service;
const NUM_OF_ITEMS_IN_A_BATCH = 100;

class _AffiliateRequestService extends BaseService {

  constructor() {
    super(AffiliateRequest, 'AffiliateRequest');
  }

  create(data, options) {
    const { transaction } = options;

    return new Promise(async (resolve, reject) => {
      try {
        const details = data.details;
        delete data.details;

        const affiliateRequest = await this.model.create(data, {
          transaction,
        });

        details.forEach((item) => {
          item.affiliate_request_id = affiliateRequest.id;
        });

        const chunks = _.chunk(details, NUM_OF_ITEMS_IN_A_BATCH);
        await forEach(chunks, async (chunk) => {
          await AffiliateRequestDetails.bulkCreate(details, {
            transaction,
          });
        });

        resolve(affiliateRequest);
      } catch (err) {
        reject(err);
      }
    });
  }

  hasDuplicate(currencySymbol, affiliateTypeId, fromDate, toDate) {
    return new Promise(async (resolve, reject) => {
      try {
        const query = 'SELECT check_duplicate_data(:currency_symbol, :affiliate_type_id, :from_date, :to_date) as count;';
        const [items] = await db.query(query,
          {
            replacements: {
              currency_symbol: currencySymbol,
              affiliate_type_id: affiliateTypeId,
              from_date: fromDate,
              to_date: toDate,
            },
          },
          {
            type: db.QueryTypes.SELECT,
          });
        const count = items[0] ? items[0].count : 0;

        resolve(count > 0);
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

  searchDetailsList({ condition, offset, limit, order }) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await AffiliateRequestDetails.findAndCountAll({
          where: condition,
          offset,
          limit,
          order
        });

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
          },
          {
            where: {
              id,
            },
            transaction: transaction,
            returning: true,
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
