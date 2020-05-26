const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const moment = require('moment');
const v4 = require('uuid/v4');
const {
  AffiliateCodeService,
  AffiliateRequestService,
  ClientService,
  ClientAffiliateService,
} = require('app/services');
const { policyHelper } = require('app/lib/helpers');
const mapper = require('app/response-schema/affiliate-request.response-schema');
const AffiliateRequestStatus = require('app/model/value-object/affiliate-request-status');
const AffiliateRequestDetailsStatus = require('app/model/value-object/affiliate-request-details-status');

const Container = typedi.Container;
const Op = Sequelize.Op;

const controller = {
  calculateRewards: async (req, res, next) => {
    try {
      const { body, affiliateTypeId } = req;
      const { currency_symbol, from_date, to_date, details } = body;
      // Validate from date and to date

      const fromDate = moment(from_date);
      const toDate = moment(to_date);
      if (fromDate.diff(toDate) >= 0) {
        const errorMessage = res.__('CALCULATE_REWARDS_FROM_DATE_IS_INVALID', 'from_date');
        return res.badRequest(errorMessage, 'CALCULATE_REWARDS_FROM_DATE_IS_INVALID', { fields: ['from_date'] });
      }

      const affiliateRequestService = Container.get(AffiliateRequestService);
      const hasDuplicate = await affiliateRequestService.hasDuplicate(currency_symbol, affiliateTypeId, fromDate.toDate(), toDate.toDate());
      if (hasDuplicate) {
        const errorMessage = res.__('CALCULATE_REWARDS_DUPLICATE_DATA', currency_symbol);
        return res.badRequest(errorMessage, 'CALCULATE_REWARDS_DUPLICATE_DATA', { fields: ['from_date', 'to_date'] });
      }

      // Validate ext_client_id in details list
      const clientService = Container.get(ClientService);
      const clientAffiliateService = Container.get(ClientAffiliateService);
      const extClientIdList = _.uniq(details.map(item => {
        item.ext_client_id = _.trim(item.ext_client_id).toLowerCase();

        return item.ext_client_id;
      }));

      const extClientIdMapping = await clientService.getExtClientIdMapping(extClientIdList, affiliateTypeId);
      const notFoundUserIdList = [];

      extClientIdList.forEach(id => {
        if (!extClientIdMapping[id]) {
          notFoundUserIdList.push(id);
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
          client_affiliate_id: extClientIdMapping[item.ext_client_id],
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

  search: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { query, affiliateTypeId } = req;
      const { offset, limit } = query;
      const keyword = _.trim(query.keyword);
      logger.info('AffiliateRequest::search');

      const andCondition = [
        {
          affiliate_type_id: affiliateTypeId
        }
      ];

      if (keyword) {
        const cond2 = {
          [Op.or]: [
            {
              status: {
                [Op.substring]: keyword,
              },
            },
            {
              currency_symbol: {
                [Op.substring]: keyword,
              },
            },
          ]
        };

        andCondition.push(cond2);
      }

      const condition = {
        [Op.and]: andCondition,
      };

      const off = parseInt(offset);
      const lim = parseInt(limit);
      const order = [['created_at', 'DESC']];

      const affiliateRequestService = Container.get(AffiliateRequestService);
      const { count: total, rows: items } = await affiliateRequestService.findAndCountAll({ condition, offset: off, limit: lim, order });

      return res.ok({
        items: mapper(items),
        offset: off,
        limit: lim,
        total: total
      });
    }
    catch (err) {
      logger.error('search affiliate requests fail: ', err);
      next(err);
    }
  },

};

module.exports = controller;
