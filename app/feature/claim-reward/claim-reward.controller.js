const typedi = require('typedi');
const _ = require('lodash');
const Decimal = require('decimal.js');
const Sequelize = require('sequelize');
const db = require('app/model');
const { forEach } = require('p-iteration');
const ClaimRewardStatus = require('app/model/value-object/claim-reward-status');
const RewardStatus = require('app/model/value-object/reward-status');
const mapper = require('app/response-schema/claim-reward.response-schema');
const config = require('app/config');
const {
  ClaimRewardService,
  RewardService,
  ClientService,
  LockService,
  ClientAffiliateService,
} = require('app/services');

const Container = typedi.Container;
const Op = Sequelize.Op;

const controller = {
  claimReward: async (req, res, next) => {
    let logger, lockService, lock, transaction;

    try {
      const { body, affiliateTypeId } = req;
      const { currency_symbol, amount, latest_id, network_fee } = body;
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
      const ttl = 15 * 1000; // 15 seconds
      lock = await lockService.lockRessource(ressourceId, ttl);

      let totalReward;
      totalReward = await rewardService.getAvailableAmount(clientAffiliateId, currency_symbol, latest_id);

      totalReward = Decimal(totalReward);
      const withdrawAmount = Decimal(0);
      const availableAmount = totalReward.sub(withdrawAmount.add(amount));

      logger.info(`Processing claim request for client ${extClientId} (clientAffiliateId: ${clientAffiliateId})`, {
        currencySymbol: currency_symbol,
        availableAmount,
        totalReward,
        amount,
        network_fee,
      });

      // Allow claim reward
      const isAllowedClaimReward = availableAmount.isPos() || availableAmount.isZero();
      if (!isAllowedClaimReward) {
        await controller.unLock(lock, lockService, logger);
        const errorMessage = res.__('CLAIM_REWARDS_AMOUNT_IS_EXCEED');

        return res.forbidden(errorMessage, 'CLAIM_REWARDS_AMOUNT_IS_EXCEED', {
          fields: ['amount'],
          availableAmount,
          totalReward,
          amount,
          network_fee,
        });
      }

      transaction = await db.sequelize.transaction();
      if (latest_id) {
        await rewardService.updateWhere(
          {
            client_affiliate_id: clientAffiliateId,
            status: {
              [Op.eq]: null
            },
            id: {
              [Op.lte]: latest_id,
            },
          },
          {
            status: RewardStatus.Pending,
          },
          { transaction });
      }

      const data = {
        client_affiliate_id: clientAffiliateId,
        currency_symbol,
        amount,
        network_fee,
        affiliate_type_id: affiliateTypeId,
        status: ClaimRewardStatus.Pending,
        latest_id,
      };
      const claimReward = await claimRewardService.create(data, { transaction });
      await transaction.commit();

      logger.info(`Client ${extClientId} (clientAffiliateId: ${clientAffiliateId}) has been claim reward`, {
        claimRewardId: claimReward.id,
        availableAmount: availableAmount.toDecimalPlaces(8).toNumber(),
        totalReward: totalReward.toDecimalPlaces(8).toNumber(),
        withdrawAmount: withdrawAmount.toDecimalPlaces(8).toNumber(),
        currency_symbol,
      });

      await controller.unLock(lock, lockService, logger);

      return res.ok(mapper(claimReward));
    }
    catch (err) {
      if (transaction) {
        await transaction.rollback();
      }

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
        client_affiliate_id: clientAffiliateId,
      };

      if (currency_symbol) {
        condition.currency_symbol = { [Op.iLike]: `${query.currency_symbol}` };
      }

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

  updateClaimRewardStatus: async (req, res, next) => {
    const logger = Container.get('logger');
    let transaction;

    try {
      logger.info('updateClaimRewardStatus');
      const { body, params, affiliateTypeId, organizationId } = req;
      const { status, id_list } = body;
      const claimRewardService = Container.get(ClaimRewardService);
      const clientAffiliateService = Container.get(ClientAffiliateService);
      const claimRewards = await claimRewardService.findAll({ id: id_list });
      const notFoundIdList = [];
      const notPendingIdList = [];
      const cache = {};

      await forEach(claimRewards, async (claimReward) => {
        cache[claimReward.id] = claimReward;

        if (!(claimReward.status === ClaimRewardStatus.Pending || claimReward.status === status)) {
          notPendingIdList.push(claimReward.id);
        }

        const clientAffiliate = await clientAffiliateService.findByPk(claimReward.client_affiliate_id);
        if (clientAffiliate.affiliate_type_id != affiliateTypeId) {
          notFoundIdList.push(claimReward.id);
        }
      });

      id_list.forEach(id => {
        if (!cache[id]) {
          notFoundIdList.push(id);
        }
      });

      if (notFoundIdList.length > 0) {
        return res.notFound(res.__('CLAIM_REWARD_IS_NOT_FOUND'), 'CLAIM_REWARD_IS_NOT_FOUND', { field: ['notFoundIdList'], id_list: notFoundIdList });
      }

      if (notPendingIdList.length > 0) {
        return res.forbidden(res.__('CAN_NOT_UPDATE_CLAIM_REQUEST_STATUS'), 'CAN_NOT_UPDATE_CLAIM_REQUEST_STATUS', { id_list: notPendingIdList });
      }

      const rewardService = Container.get(RewardService);
      transaction = await db.sequelize.transaction();

      await forEach(claimRewards, async (claimReward) => {
        const { latest_id, client_affiliate_id } = claimReward;

        if (latest_id) {
          await rewardService.updateWhere(
            {
              client_affiliate_id: client_affiliate_id,
              status: RewardStatus.Pending,
              id: {
                [Op.lte]: latest_id,
              },
            },
            {
              status: RewardStatus.Approved,
            },
            { transaction });
        }
      });

      const cond = {
        id: id_list,
      };
      const data = {
        status: status,
      };
      await claimRewardService.updateWhere(cond, data, { transaction });
      await transaction.commit();

      return res.ok(true);
    }
    catch (err) {
      if (transaction) {
        await transaction.rollback();
      }

      logger.error(err);

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
