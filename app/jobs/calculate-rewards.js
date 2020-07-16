const _ = require('lodash');
const { forEach, forEachSeries } = require('p-iteration');
const { Container, Service } = require('typedi');
const { v4 } = require('uuid');
const Decimal = require('decimal.js');
const Sequelize = require('sequelize');
const db = require('app/model');
const config = require('../config');
const {
  AffiliateCodeService,
  AffiliateRequestService,
  ClientService,
  ClientAffiliateService,
  PolicyService,
  RewardService,
  AffiliateTypeService,
} = require('../services');
const AffiliateRequestStatus = require('../model/value-object/affiliate-request-status');
const AffiliateRequestDetailsStatus = require('../model/value-object/affiliate-request-details-status');
const PolicyType = require('app/model/value-object/policy-type');
const CommissonType = require('app/model/value-object/commisson-type');
const policyHelper = require('app/lib/helpers/policy-helper');
const PolicyData = require('./policy-data');

const Op = Sequelize.Op;
const sequelize = db.sequelize;
const ROUND_DECIMAL_DIGITS = 10;

class CalculateRewards {

  constructor() {
    this.logger = Container.get('logger');
    this.redisCacherService = Container.get('redisCacherService');
    this.affiliateRequestService = Container.get(AffiliateRequestService);
    this.clientService = Container.get(ClientService);
    this.clientAffiliateService = Container.get(ClientAffiliateService);
    this.affiliateTypeService = Container.get(AffiliateTypeService);
    this.policyService = Container.get(PolicyService);

    this.cache = {};
  }

  async getRewardList({
    affiliateTypeId,
    currencySymbol,
    affiliateRequestDetails
  }
  ) {
    const { logger, clientAffiliateService, redisCacherService, policyService, affiliateTypeService } = this;
    const { id, client_affiliate_id, affiliate_request_id, amount } = affiliateRequestDetails;
    const clientAffiliateId = client_affiliate_id;
    logger.debug(`Processing request details clientAffiliateId: ${clientAffiliateId}.`);
    const clientAffiliate = await clientAffiliateService.findByPk(client_affiliate_id);
    const referrerList = await clientAffiliateService.getReferrerList(clientAffiliate);

    logger.debug(`Referrer list clientAffiliateId: ${clientAffiliateId}: `, referrerList.map(item => item.id));
    const rootClientAffiliate = !clientAffiliate.referrer_client_affiliate_id ? clientAffiliate : referrerList.find((item) => item.level === 1);

    if (!rootClientAffiliate) {
      throw new Error(`Can not find root client for client who has id: ${client_affiliate_id}`);
    }

    const { policies } = await policyHelper.getPolicyForRootClient({
      rootClientAffiliateId: rootClientAffiliate.id,
      affiliateTypeId: rootClientAffiliate.affiliate_type_id,
      clientAffiliateService,
      affiliateTypeService,
      currencySymbol: currencySymbol,
    });

    const policyDataList = policies.map((policy) => {
      const policyData = new PolicyData({
        stakerId: clientAffiliateId,
        amount,
        affiliateRequestDetails,
        referrerList,
        policy,
        affiliateTypeId: affiliateTypeId,
        currencySymbol: currencySymbol,
      });

      return policyData;
    });

    const allRewardList = await this.calculateRewards(policyDataList);

    return allRewardList;
  }

  async calculateRewards(policyDataList) {
    let allRewardList = [];

    await forEachSeries(policyDataList, async (policyData) => {
      if (policyData.policy.type === PolicyType.MEMBERSHIP) {
        allRewardList = allRewardList.concat(await this.processMembershipPolicy(policyData));
      } else if (policyData.policy.type === PolicyType.MEMBERSHIP_AFFILIATE) {
        allRewardList = allRewardList.concat(await this.processMembershipAffiliatePolicy(policyData));
      } else if (policyData.policy.type === PolicyType.AFFILIATE) {
        allRewardList = allRewardList.concat(await this.processAffliatePolicy(policyData));
      }
    });

    return allRewardList;
  }

  async processMembershipPolicy(policyData) {
    const { stakerId, amount, affiliateRequestDetails, referrerList, policy, affiliateTypeId, currencySymbol } = policyData;
    this.logger.debug(`Processing membership policy for staker ${stakerId} with amount ${amount}.\n`, policy.get({ plain: true }));
    const { max_levels, proportion_share, membership_rate } = policy;
    const rewardList = [];
    if (proportion_share == 0 || amount == 0) {
      return rewardList;
    }

    // Get rate for memberhip clients
    const { clientService } = this;
    const client = await this.getClientByClientAffiliateId(stakerId, affiliateTypeId, clientService);
    if (!client) {
      return rewardList;
    }

    this.logger.debug(`Processing membership policy for ${client.ext_client_id}.`);
    if (!client.actived_flg) {
      this.logger.info(`Client ${client.ext_client_id} is not active.`);
      return rewardList;
    }

    const membershipTypeId = client.membership_type_id;
    this.logger.debug(`MembershipType: ${membershipTypeId ? membershipTypeId : 'NA'} .`);
    if (!membershipTypeId) {
      return rewardList;
    }

    const rate = membership_rate[membershipTypeId];
    if (_.isUndefined(rate)) {
      this.logger.warn('Can not get rate for membership: ', membershipTypeId);
      return rewardList;
    }

    const shareAmount = Decimal(amount).times(proportion_share / 100);

    rewardList.push({
      client_affiliate_id: stakerId,
      affiliate_request_id: affiliateRequestDetails.affiliate_request_id,
      affiliate_request_detail_id: affiliateRequestDetails.id,
      policy_id: policy.id,
      policy_type: PolicyType.MEMBERSHIP,
      currency_symbol: currencySymbol,
      amount: shareAmount.times(rate / 100).toDecimalPlaces(ROUND_DECIMAL_DIGITS).toNumber(),
      commisson_type: CommissonType.Direct,
      referrer_client_affiliate_id: null,
      level: null,
      status: null,
    });

    this.logger.debug('Output: ', rewardList);

    return rewardList;
  }

  async processMembershipAffiliatePolicy(policyData) {
    const { stakerId, amount, affiliateRequestDetails, referrerList, policy, affiliateTypeId, currencySymbol } = policyData;
    this.logger.debug(`Processing membership policy for staker ${stakerId} with amount ${amount}.\n`, policy.get({ plain: true }));
    const { max_levels, proportion_share, membership_rate } = policy;
    let { rates } = policy;

    const shareAmount = Decimal(amount).times(proportion_share / 100);
    if (shareAmount == 0) {
      return [];
    }

    const rewardList = [];
    const { clientService } = this;
    rates = (rates || []).map(x => Number(x));

    await forEach(_.zip(referrerList, rates), async (arrays, index) => {
      const [referrer, rate] = arrays;

      if (referrer && rate) {
        const clientAffiliateId = referrer.id;
        const client = await this.getClientByClientAffiliateId(clientAffiliateId, affiliateTypeId, clientService);
        if (!client) {
          return;
        }

        this.logger.debug(`Processing membership affliate policy for ${client.ext_client_id}.`);
        if (!client.actived_flg) {
          this.logger.info(`Client ${client.ext_client_id} is not active.`);
          return;
        }

        // Get rate for membership client
        const membershipTypeId = client.membership_type_id;
        const membershipRate = membership_rate[membershipTypeId];
        this.logger.debug(`MembershipType: ${membershipTypeId}, membershipRate: ${membershipRate}.`);
        if (_.isUndefined(membershipRate)) {
          this.logger.warn('Can not get rate for membership: ', membershipTypeId);
          return;
        }

        const invitee = referrerList.find(x => x.referrer_client_affiliate_id == clientAffiliateId);

        rewardList.push({
          client_affiliate_id: clientAffiliateId,
          affiliate_request_id: affiliateRequestDetails.affiliate_request_id,
          affiliate_request_detail_id: affiliateRequestDetails.id,
          policy_id: policy.id,
          policy_type: PolicyType.MEMBERSHIP_AFFILIATE,
          currency_symbol: currencySymbol,
          amount: shareAmount.times((rate / 100) * (membershipRate / 100)).toDecimalPlaces(ROUND_DECIMAL_DIGITS).toNumber(),
          commisson_type: index === 0 ? CommissonType.Direct : CommissonType.Indirect,
          referrer_client_affiliate_id: invitee ? invitee.id : null,
          level: index + 1,
          status: null,
        });
      }
    });

    this.logger.debug('Output: ', rewardList);

    return rewardList;
  }

  async processAffliatePolicy(policyData) {
    const { stakerId, amount, affiliateRequestDetails, referrerList, policy, affiliateTypeId, currencySymbol } = policyData;
    const isMembershipSystem = policy.is_membership_system;

    if (isMembershipSystem) {
      this.logger.debug(`Processing affliate policy when ${stakerId} purchased a package with amount ${amount} ${currencySymbol}.\n`, policy.get({ plain: true }));
    } else {
      this.logger.debug(`Processing affliate policy for staker ${stakerId} with amount ${amount}.\n`, policy.get({ plain: true }));
    }

    const { clientService } = this;
    const { max_levels, proportion_share } = policy;
    let { rates } = policy;
    const shareAmount = Decimal(amount).times(proportion_share / 100);
    if (shareAmount == 0) {
      return [];
    }

    const rewardList = [];
    rates = (rates || []).map(x => Number(x));

    await forEach(_.zip(referrerList, rates), async (arrays, index) => {
      const [referrer, rate] = arrays;

      if (referrer && rate) {
        const clientAffiliateId = referrer.id;
        const client = await this.getClientByClientAffiliateId(clientAffiliateId, affiliateTypeId, clientService);
        if (!client) {
          return;
        }

        this.logger.debug(`Processing affliate policy for ${client.ext_client_id}.`);
        if (!client.actived_flg) {
          this.logger.info(`Client ${client.ext_client_id} is not active.`);
          return;
        }

        const invitee = referrerList.find(x => x.referrer_client_affiliate_id == clientAffiliateId);

        rewardList.push({
          client_affiliate_id: clientAffiliateId,
          affiliate_request_id: affiliateRequestDetails.affiliate_request_id,
          affiliate_request_detail_id: affiliateRequestDetails.id,
          policy_id: policy.id,
          policy_type: PolicyType.AFFILIATE,
          currency_symbol: currencySymbol,
          amount: shareAmount.times(rate / 100).toDecimalPlaces(ROUND_DECIMAL_DIGITS).toNumber(),
          commisson_type: index === 0 ? CommissonType.Direct : CommissonType.Indirect,
          referrer_client_affiliate_id: invitee ? invitee.id : null,
          level: index + 1,
          status: null,
        });
      }
    });

    this.logger.debug('Output: ', rewardList);
    return rewardList;
  }

  // Get client then save into cache
  async getClientByClientAffiliateId(clientAffiliateId, affiliateTypeId, clientService) {
    const key = `client-${clientAffiliateId}-${affiliateTypeId}`.toUpperCase();
    let client = this.cache[key];
    if (client) {
      return client;
    }

    client = await clientService.findByClientAffiliateId(clientAffiliateId, affiliateTypeId);
    if (client) {
      this.cache[key] = client;
    }

    return client;
  }

}

module.exports = CalculateRewards;
