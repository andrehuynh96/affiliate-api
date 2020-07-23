const typedi = require('typedi');
const Sequelize = require('sequelize');
const BaseService = require('./base-service');
const db = require('app/model').sequelize;
const AffiliateRequestDetails = require('app/model').affiliate_request_details;

const Service = typedi.Service;

class _AffiliateRequestDetailService extends BaseService {
    constructor() {
        super(AffiliateRequestDetails, 'AffiliateRequestDetails');
    }
    getByAffiliateRequestId(affiliateRequestId) {
        return new Promise(async (resolve, reject) => {
          try {
            const cond = {
              where: {
                affiliate_request_id: affiliateRequestId,
              }
            };
            const result = await AffiliateRequestDetails.findOne(cond);

            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
    }
}

const AffiliateRequestDetailService = Service([], () => {
    const service = new _AffiliateRequestDetailService();

    return service;
  });

  module.exports = AffiliateRequestDetailService;