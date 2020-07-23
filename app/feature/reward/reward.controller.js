const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const moment = require('moment');
const { map, forEach } = require('p-iteration');
const v4 = require('uuid/v4');
const Decimal = require('decimal.js');
const {
  AffiliateCodeService,
  AffiliateRequestService,
  ClientService,
  ClientAffiliateService,
  RewardService,
  ClaimRewardService,
  AffiliateTypeService,
} = require('app/services');
const { policyHelper } = require('app/lib/helpers');
const mapper = require('app/response-schema/affiliate-request.response-schema');
const affiliateRequestDetailsMapper = require('app/response-schema/affiliate-request-details.response-schema');
const rewardMapper = require('app/response-schema/reward.response-schema');
const AffiliateRequestStatus = require('app/model/value-object/affiliate-request-status');
const AffiliateRequestDetailsStatus = require('app/model/value-object/affiliate-request-details-status');
const ClaimRewardStatus = require('app/model/value-object/claim-reward-status');
const AffiliateType = require('app/model').affiliate_types;
const db = require('app/model');
const config = require('app/config');


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

      const transaction = await db.sequelize.transaction();
      try {
        const affiliateRequest = await affiliateRequestService.create(data, { transaction });

        // Add to queue job
        const calculateRewardsJob = Container.get('calculateRewardsJob');
        const job = await calculateRewardsJob.addJob(affiliateRequest);

        affiliateRequest.job_id = job.id + '';
        await affiliateRequestService.updateWhere(
          {
            id: affiliateRequest.id
          },
          {
            job_id: affiliateRequest.job_id,
          },
          { transaction });
        await transaction.commit();

        return res.ok(affiliateRequest);
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    }
    catch (err) {
      next(err);
    }
  },

  viewRewardHistories: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      logger.info('Rewards::viewRewardHistories');
      const { query, affiliateTypeId } = req;
      const { offset, limit } = query;
      const extClientId = _.trim(query.ext_client_id).toLowerCase();
      const clientAffiliateService = Container.get(ClientAffiliateService);
      const clientAffiliate = await clientAffiliateService.findByExtClientIdAndAffiliateTypeId(extClientId, affiliateTypeId);

      if (!clientAffiliate) {
        const errorMessage = res.__('NOT_FOUND_EXT_CLIENT_ID', extClientId);
        return res.badRequest(errorMessage, 'NOT_FOUND_EXT_CLIENT_ID', { fields: ['ext_client_id'] });
      }

      const condition = {
        client_affiliate_id: clientAffiliate.id,
      };
      const off = parseInt(offset);
      const lim = parseInt(limit);
      const order = [['created_at', 'DESC']];
      const rewardService = Container.get(RewardService);
      const { count: total, rows: items } = await rewardService.findAndCountAll({ condition, offset: off, limit: lim, order });

      return res.ok({
        items: rewardMapper(items),
        offset: off,
        limit: lim,
        total: total
      });
    }
    catch (err) {
      logger.error('search rewards: ', err);
      next(err);
    }
  },

  getRewardStatistics: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      logger.info('Rewards::getRewardStatistics');
      const { query, affiliateTypeId } = req;
      const { offset, limit } = query;
      const extClientId = _.trim(query.ext_client_id).toLowerCase();
      const clientAffiliateService = Container.get(ClientAffiliateService);
      const clientAffiliate = await clientAffiliateService.findByExtClientIdAndAffiliateTypeId(extClientId, affiliateTypeId);

      if (!clientAffiliate) {
        const errorMessage = res.__('NOT_FOUND_EXT_CLIENT_ID', extClientId);
        return res.badRequest(errorMessage, 'NOT_FOUND_EXT_CLIENT_ID', { fields: ['ext_client_id'] });
      }

      const defaultCurrencyList = [...config.membership.defaultCurrencyList];
      const rewardService = Container.get(RewardService);
      const claimRewardService = Container.get(ClaimRewardService);
      const currencyList = await rewardService.getCurrencyListForAffiliateClient(clientAffiliate.id);

      // Client doesn't have any reward
      if (!currencyList.length) {
        const result = defaultCurrencyList.map(currency => {
          return {
            currency,
            total_amount: 0,
            available_amount: 0,
            pending_amount: 0,
            paid_amount: 0,
          };
        });

        return res.ok(result);
      }

      const notFoundCurrencyList = defaultCurrencyList;
      const result = await map(currencyList, async (item) => {
        const { currency_symbol } = item;
        if (defaultCurrencyList.includes(currency_symbol)) {
          _.remove(notFoundCurrencyList, (item) => item === currency_symbol);
        }

        const latestId = await rewardService.getLatestId(clientAffiliate.id, currency_symbol);
        const getTotalRewardTask = rewardService.getAvailableAmount(clientAffiliate.id, currency_symbol, latestId);
        const getPendingAmountClaimRewardTask = claimRewardService.getTotalAmount(clientAffiliate.id, currency_symbol, [ClaimRewardStatus.Pending]);
        const getPaidAmountOfClaimRewardTask = claimRewardService.getTotalAmount(clientAffiliate.id, currency_symbol, [
          ClaimRewardStatus.Approved,
          ClaimRewardStatus.InProcessing,
          ClaimRewardStatus.Completed,
        ]);
        // eslint-disable-next-line prefer-const
        let [totalReward, withdrawAmount, pendingAmount] = await Promise.all([
          getTotalRewardTask,
          getPaidAmountOfClaimRewardTask,
          getPendingAmountClaimRewardTask,
        ]);

        totalReward = Decimal(totalReward);

        return {
          currency: currency_symbol,
          latest_id: latestId,
          total_amount: totalReward.toNumber(),
          pending_amount: pendingAmount,
          paid_amount: withdrawAmount,
        };
      });

      if (notFoundCurrencyList.length > 0) {
        notFoundCurrencyList.forEach(currency => {
          result.push({
            currency: currency,
            latest_id: null,
            total_amount: 0,
            pending_amount: 0,
            paid_amount: 0,
          });
        });
      }

      return res.ok(result);
    }
    catch (err) {
      logger.error('getRewardStatistics', err);
      next(err);
    }
  },

  getAffiliateRewardStatistics: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      logger.info('Rewards::getAffiliateRewardStatistics');
      const { query, affiliateTypeId } = req;
      const { offset, limit } = query;
      const extClientId = _.trim(query.ext_client_id).toLowerCase();
      const clientAffiliateService = Container.get(ClientAffiliateService);
      const clientAffiliate = await clientAffiliateService.findByExtClientIdAndAffiliateTypeId(extClientId, affiliateTypeId);

      if (!clientAffiliate) {
        const errorMessage = res.__('NOT_FOUND_EXT_CLIENT_ID', extClientId);
        return res.badRequest(errorMessage, 'NOT_FOUND_EXT_CLIENT_ID', { fields: ['ext_client_id'] });
      }

      const defaultCurrencyList = [...config.affiliate.defaultCurrencyList];
      const rewardService = Container.get(RewardService);
      const claimRewardService = Container.get(ClaimRewardService);
      const affiliateTypeService = Container.get(AffiliateTypeService);
      const currencyList = await rewardService.getCurrencyListForAffiliateClient(clientAffiliate.id);
      const notFoundCurrencyList = defaultCurrencyList;
      const result = await map(currencyList, async (item) => {
        const { currency_symbol } = item;
        if (defaultCurrencyList.includes(currency_symbol)) {
          _.remove(notFoundCurrencyList, (item) => item === currency_symbol);
        }

        const latestId = await rewardService.getLatestId(clientAffiliate.id, currency_symbol);
        const getTotalRewardTask = rewardService.getTotalAmountGroupByLevel(clientAffiliate.id, currency_symbol, latestId);
        const getPendingAmountClaimRewardTask = claimRewardService.getTotalAmount(clientAffiliate.id, currency_symbol, [ClaimRewardStatus.Pending]);
        const getPaidAmountOfClaimRewardTask = claimRewardService.getTotalAmount(clientAffiliate.id, currency_symbol, [
          ClaimRewardStatus.Approved,
          ClaimRewardStatus.InProcessing,
          ClaimRewardStatus.Completed,
        ]);

        // eslint-disable-next-line prefer-const
        let [groupTotalReward, withdrawAmount, pendingAmount] = await Promise.all([
          getTotalRewardTask,
          getPaidAmountOfClaimRewardTask,
          getPendingAmountClaimRewardTask,
        ]);

        let totalReward = Decimal(0);
        const rewardList = groupTotalReward.map(item => {
          const amount = Decimal(Number(item.total));
          totalReward = totalReward.add(amount);

          return {
            level: item.level || 0,
            amount: amount.toNumber(),
          };
        });

        const availableAmount = totalReward.sub(Number(pendingAmount)).toNumber();

        return {
          currency_symbol: currency_symbol,
          latest_id: latestId,
          reward_list: rewardList,
          total_amount: totalReward.toNumber(),
          // available_amount: availableAmount,
          pending_amount: pendingAmount,
          paid_amount: withdrawAmount,
        };
      });

      if (notFoundCurrencyList.length > 0) {
        notFoundCurrencyList.forEach(currency => {
          result.push({
            currency_symbol: currency,
            latest_id: null,
            reward_list: [],
            total_amount: 0,
            // available_amount: 0,
            pending_amount: 0,
            paid_amount: 0,
          });
        });
      }

      // Fill policy info
      const levelList = [0];
      for (let level = 1; level <= config.affiliate.maxLevels; level++) {
        levelList.push(level);
      }

      await forEach(result, async item => {
        const membershipPolicy = await policyHelper.getMembershipPolicyForCurrency({
          currencySymbol: item.currency_symbol,
          affiliateTypeId,
          affiliateTypeService,
        });

        levelList.forEach(level => {
          let levelInfo = item.reward_list.find(rw => rw.level === level);

          if (!levelInfo) {
            levelInfo = {
              level,
              amount: 0
            };

            item.reward_list.push(levelInfo);
          }

          if (level === 0 && membershipPolicy) {
            levelInfo.membership_policy = {
              proportion_share: Number(membershipPolicy.proportion_share),
              membership_rate: membershipPolicy.membership_rate,
            };
          }

          item.reward_list = _.sortBy(item.reward_list, 'level');
        });

      });

      return res.ok(result);
    }
    catch (err) {
      logger.error('getAffiliateRewardStatistics', err);
      next(err);
    }
  },

  searchAffiliateRequests: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      logger.info('ffiliateRequests::search');
      const { query } = req;
      const { offset, limit } = query;
      let fromDate, toDate;
      const condition = {};

      if (query.from_date) {
        fromDate = moment(query.from_date).toDate();
        condition.from_date = {
          [Op.gte]: fromDate,
        };
      }
      if (query.to_date) {
        toDate = moment(query.to_date).add(1, 'minute').toDate();
        condition.to_date = {
          [Op.lt]: toDate,
        };
      }
      if (fromDate && toDate && fromDate >= toDate) {
        return res.badRequest(res.__('TO_DATE_MUST_BE_GREATER_THAN_OR_EQUAL_FROM_DATE'), 'TO_DATE_MUST_BE_GREATER_THAN_OR_EQUAL_FROM_DATE', { field: ['from_date', 'to_date'] });
      }

      if (query.status) {
        condition.status = query.status;
      }

      if (query.currency) {
        condition.currency_symbol = { [Op.iLike]: query.currency };
      }

      const off = parseInt(offset);
      const lim = parseInt(limit);
      const order = [['from_date','DESC'],['to_date','DESC']];
      const affiliateRequestService = Container.get(AffiliateRequestService);
      const { count: total, rows: items } = await affiliateRequestService.findAndCountAll({ condition, offset: off, limit: lim, order });

      const affiliateTypeService = Container.get(AffiliateTypeService);
      const affiliateTypeIdList = _.uniq(items.map(x => x.affiliate_type_id));
      const affiliateTypes = await affiliateTypeService.findAll({
        id: {
          [Op.in]: affiliateTypeIdList,
        },
      });

      items.forEach((item) => {
        const affiliateType = affiliateTypes.find(x => x.id === item.affiliate_type_id);

        item.affiliateType = affiliateType ? affiliateType.name : null;
      });

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

  getAffiliateRequestDetails: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      logger.info('getAffiliateRequestDetails::search');
      const { body, params } = req;
      const { requestId } = params;
      const affiliateRequestService = Container.get(AffiliateRequestService);
      const options = {
        include: [
          {
            model: AffiliateType,
            as: 'AffiliateType',
          }
        ],
      };
      const affiliateRequest = await affiliateRequestService.findByPk(requestId, options);

      if (!affiliateRequest) {
        return res.notFound(res.__('AFFILIATE_REQUEST_DETAIL_IS_NOT_FOUND'), 'AFFILIATE_REQUEST_DETAIL_IS_NOT_FOUND');
      }

      affiliateRequest.affiliateType = affiliateRequest.AffiliateType ? affiliateRequest.AffiliateType.name : null;

      return res.ok(mapper(affiliateRequest));
    }
    catch (err) {
      logger.error('getAffiliateRequestDetails: ', err);
      next(err);
    }
  },

  getAffiliateRequestDetailList: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      logger.info('getAffiliateRequestDetails::search');
      const { body, params, query } = req;
      const { requestId } = params;
      const { offset, limit } = query;
      const affiliateRequestService = Container.get(AffiliateRequestService);
      const affiliateRequest = await affiliateRequestService.findByPk(requestId);

      if (!affiliateRequest) {
        return res.notFound(res.__('AFFILIATE_REQUEST_DETAIL_IS_NOT_FOUND'), 'AFFILIATE_REQUEST_DETAIL_IS_NOT_FOUND');
      }

      const condition = {
        affiliate_request_id: affiliateRequest.id,
      };
      const off = parseInt(offset);
      const lim = parseInt(limit);
      const order = [['created_at', 'DESC']];
      const { count: total, rows: items } = await affiliateRequestService.searchDetailsList({ condition, offset: off, limit: lim, order });

      let result = [];
      if (items.length > 0) {
        // Get email list
        const clientService = Container.get(ClientService);
        const clientAffiliateIdList = items.map(item => item.client_affiliate_id);
        const clientMapping = await clientService.getClientMappingByClientAffiliateIdList(clientAffiliateIdList);

        result = items.map(item => {
          const client = clientMapping[item.client_affiliate_id];

          return {
            ...item.get({ plain: true }),
            extClientId: client ? client.ext_client_id : null,
            currency_symbol: affiliateRequest.currency_symbol,
          };
        });
      }

      return res.ok({
        items: affiliateRequestDetailsMapper(result),
        offset: off,
        limit: lim,
        total: total
      });
    }
    catch (err) {
      logger.error('getAffiliateRequestDetails: ', err);
      next(err);
    }
  },
  getRewardsByAffiliateRequestDetailId: async (req,res,next ) => {
    const logger = Container.get('logger');
    try {
      logger.info('getRewardsByRequestDetailId::getAll');
      const { params } = req;
      const { requestDetailId } = params;
      const rewardService = Container.get(RewardService);

      const rewards = await rewardService.getRewardsAndPolicy(requestDetailId);
      let result = [];
      if (rewards.length > 0) {
        const clientService = Container.get(ClientService);
        const clientAffiliateIdList = rewards.map(item => item.client_affiliate_id);
        const clientMapping = await clientService.getClientMappingByClientAffiliateIdList(clientAffiliateIdList);

        result = rewards.map(item => {
          const client = clientMapping[item.client_affiliate_id];

          return {
            ext_client_id: client ? client.ext_client_id : null,
            amount: item.amount,
            currency_symbol: item.currency_symbol,
            policy: item.Policy.name,
            level: item.level,
            commission_type: item.commisson_type
          };
        });
      }
      return res.ok(result);
    }
    catch (error) {
      logger.error('getRewardsByRequestDetailId: ', error);
      next(error);
    }
  },
};

module.exports = controller;
