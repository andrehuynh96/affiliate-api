const typedi = require('typedi');
const _ = require('lodash');
const Decimal = require('decimal.js');
const ClaimRewardStatus = require('app/model/value-object/claim-reward-status');
const mapper = require('app/response-schema/reward.response-schema');
const config = require('app/config');
const {
  ClaimRewardService,
  RewardService,
  ClientService,
  LockService,
} = require('app/services');

const Container = typedi.Container;

const controller = {
  calculateRewards: async (req, res, next) => {
    let logger, lockService, lock;

    try {
      const { body, affiliateTypeId } = req;
      const { currency_symbol, amount } = body;
      const extClientId = _.trim(body.ext_client_id).toLowerCase();

      // Validate ext_client_id
      const clientService = Container.get(ClientService);
      const extClientIdList = [extClientId];
      const extClientIdMapping = await clientService.getExtClientIdMapping(extClientIdList, affiliateTypeId);
      const clientAffiliateId = extClientIdMapping[extClientId];

      if (!clientAffiliateId) {
        const errorMessage = res.__('CLAIM_REWARDS_NOT_FOUND_EXT_CLIENT_ID', extClientId);
        return res.badRequest(errorMessage, 'CLAIM_REWARDS_NOT_FOUND_EXT_CLIENT_ID', { fields: ['ext_client_id'] });
      }

      const rewardService = Container.get(RewardService);
      const claimRewardService = Container.get(ClaimRewardService);
      logger = Container.get('logger');
      lockService = Container.get(LockService);

      // Prevent run pararell
      const ressourceId = _.kebabCase(['claim-reward', clientAffiliateId, currency_symbol].join('-'));
      const ttl = 10 * 1000; // 10 seconds
      lock = await lockService.lockRessource(ressourceId, ttl);

      const getTotalRewardTask = rewardService.getTotalAmount(clientAffiliateId, currency_symbol);
      const getTotalAmountOfClaimRewardTask = claimRewardService.getTotalAmount(clientAffiliateId, currency_symbol);
      let [totalReward, withdrawAmount] = await Promise.all([getTotalRewardTask, getTotalAmountOfClaimRewardTask]);

      totalReward = Decimal(totalReward);
      withdrawAmount = Decimal(withdrawAmount);
      const availableAmount = totalReward.sub(withdrawAmount.add(amount));

      // Allow claim reward
      const isAllowedClaimReward = availableAmount.isPos() || availableAmount.isZero();
      if (!isAllowedClaimReward) {
        await controller.unLock(lock, lockService, logger);
        const errorMessage = res.__('CLAIM_REWARDS_AMOUNT_IS_EXCEED');

        return res.forbidden(errorMessage, 'CLAIM_REWARDS_AMOUNT_IS_EXCEED', { fields: ['amount'] });
      }

      const data = {
        client_affiliate_id: clientAffiliateId,
        currency_symbol,
        amount,
        affiliate_type_id: affiliateTypeId,
        status: ClaimRewardStatus.PENDING,
      };
      const claimReward = await claimRewardService.create(data);

      logger.info(`Client ${extClientId} (clientAffiliateId: ${clientAffiliateId}) has been claim reward`, {
        claimRewardId: claimReward.id,
        availableAmount: availableAmount.toDecimalPlaces(8).toNumber(),
        totalReward: totalReward.toDecimalPlaces(8).toNumber(),
        withdrawAmount: withdrawAmount.toDecimalPlaces(8).toNumber(),
        currency_symbol
      });

      await controller.unLock(lock, lockService, logger);

      return res.ok(mapper(claimReward));
    }
    catch (err) {
      await controller.unLock(lock, lockService, logger);

      next(err);
    }
  },

  search: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { query, affiliateTypeId } = req;
      const { currency_symbol, offset, limit } = query;
      const extClientId = _.trim(query.ext_client_id).toLowerCase();

      // Validate ext_client_id
      const clientService = Container.get(ClientService);
      const extClientIdList = [extClientId];
      const extClientIdMapping = await clientService.getExtClientIdMapping(extClientIdList, affiliateTypeId);
      const clientAffiliateId = extClientIdMapping[extClientId];

      if (!clientAffiliateId) {
        const errorMessage = res.__('CLAIM_REWARDS_NOT_FOUND_EXT_CLIENT_ID', extClientId);
        return res.badRequest(errorMessage, 'CLAIM_REWARDS_NOT_FOUND_EXT_CLIENT_ID', { fields: ['ext_client_id'] });
      }

      const condition = {
        currency_symbol,
        client_affiliate_id: clientAffiliateId,
      };
      const off = parseInt(offset);
      const lim = parseInt(limit);
      const order = [['created_at', 'DESC']];
      const claimRewardService = Container.get(ClaimRewardService);
      const { count: total, rows: items } = await claimRewardService.findAndCountAll({ condition, offset: off, limit: lim, order });

      return res.ok({
        items: mapper(items),
        offset: off,
        limit: lim,
        total: total
      });
    }
    catch (err) {
      logger.error('get claim reward list fail: ', err);
      next(err);
    }
  },

  async unLock(lock, lockService, logger) {
    if (lock) {
      try {
        await lockService.unlockLock(lock);
      } catch (e) {
        logger.debug(e);
      }
    }
  }

};

module.exports = controller;