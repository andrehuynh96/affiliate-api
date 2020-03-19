const typedi = require('typedi');
const _ = require('lodash');
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
      const clientService = Container.get(ClientService);

      // Validate user_id in details list
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

      const affiliateRequestService = Container.get(AffiliateRequestService);
      const requestDetailsLists = details.map((item) => {
        return {
          client_id: clientDic[item.user_id].id,
          amount: item.amount,
          status: AffiliateRequestDetailsStatus.PENDING,
        };
      });
      const data = {
        status: AffiliateRequestStatus.PENDING,
        currency_symbol,
        from_date,
        to_date,
        affiliate_type_id: affiliateTypeId,
        details: requestDetailsLists,
      };
      const affiliateRequest = await affiliateRequestService.create(data);

      return res.ok(affiliateRequest);
    }
    catch (err) {
      next(err);
    }
  },

};

module.exports = controller;
