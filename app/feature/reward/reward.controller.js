const typedi = require('typedi');
const _ = require('lodash');
const moment = require('moment');
const v4 = require('uuid/v4');
const {
  AffiliateCodeService,
  AffiliateRequestService,
  ClientService,
} = require('../../services');
const { policyHelper } = require('../../lib/helpers');
const AffiliateRequestStatus = require('../../model/value-object/affiliate-request-status');
const AffiliateRequestDetailsStatus = require('../../model/value-object/affiliate-request-details-status');

const Container = typedi.Container;

const controller = {
  calculateRewards: async (req, res, next) => {
    try {
      const { body, affiliateTypeId } = req;
      const { currency_symbol, from_date, to_date, details } = body;
      // Validate from date and to date

      console.info(from_date, to_date);
      const fromDate = moment(from_date);
      const toDate = moment(to_date);
      if (fromDate.diff(toDate) >= 0) {
        const errorMessage = res.__('CALCULATE_REWARDS_FROM_DATE_IS_INVALID', 'from_date');
        return res.badRequest(errorMessage, 'CALCULATE_REWARDS_FROM_DATE_IS_INVALID', { fields: ['from_date'] });
      }

      const affiliateRequestService = Container.get(AffiliateRequestService);
      const hasDuplicate = await affiliateRequestService.hasDuplicate(currency_symbol, fromDate, toDate);
      // if (hasDuplicate) {
      //   const errorMessage = res.__('CALCULATE_REWARDS_DUPLICATE_DATA', currency_symbol);
      //   return res.badRequest(errorMessage, 'CALCULATE_REWARDS_DUPLICATE_DATA', { fields: ['from_date', 'to_date'] });
      // }

      // Validate user_id in details list
      const clientService = Container.get(ClientService);
      const userIdList = _.uniq(details.map(item => item.user_id));
      const clients = await clientService.findByIdList(userIdList, affiliateTypeId);
      const notFoundUserIdList = [];
      const clientDic = {};

      userIdList.forEach(userId => {
        const client = clients.find(client => client.user_id === userId);

        if (!client) {
          notFoundUserIdList.push(userId);
        } else {
          clientDic[userId] = client;
        }
      });

      if (notFoundUserIdList.length > 0) {
        const errorMessage = res.__('CALCULATE_REWARDS_NOT_FOUND_USER_ID_LIST', notFoundUserIdList.join(', '));
        return res.badRequest(errorMessage, 'CALCULATE_REWARDS_NOT_FOUND_USER_ID_LIST', { fields: ['details'] });
      }

      const affiliateRequestId = v4();
      const requestDetailsLists = details.map((item) => {
        return {
          affiliate_request_id: affiliateRequestId,
          client_id: clientDic[item.user_id].id,
          amount: item.amount,
          status: AffiliateRequestDetailsStatus.PENDING,
        };
      });
      const data = {
        id: affiliateRequestId,
        status: AffiliateRequestStatus.PENDING,
        currency_symbol,
        from_date: fromDate,
        to_date: toDate,
        affiliate_type_id: affiliateTypeId,
        details: requestDetailsLists,
      };
      const affiliateRequest = await affiliateRequestService.create(data);

      // Add to queue job
      const calculateRewardsJob = Container.get('calculateRewardsJob');
      const job = await calculateRewardsJob.addJob(affiliateRequest);

      affiliateRequest.job_id = job.id + '';
      await affiliateRequestService.updateWhere({
        id: affiliateRequest.id
      }, {
        job_id: affiliateRequest.job_id,
      });

      return res.ok(affiliateRequest);
    }
    catch (err) {
      next(err);
    }
  },

};

module.exports = controller;
