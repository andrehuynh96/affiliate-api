const _ = require('lodash');
const { forEach, forEachSeries } = require('p-iteration');
const typedi = require('typedi');
const Queue = require('bull');
const { v4 } = require('uuid');
const Decimal = require('decimal.js');
const Sequelize = require('sequelize');
const config = require('../config');
const {
  AffiliateCodeService,
  AffiliateRequestService,
  ClientService,
  ClientAffiliateService,
  PolicyService,
} = require('../services');
const AffiliateRequestStatus = require('../model/value-object/affiliate-request-status');
const AffiliateRequestDetailsStatus = require('../model/value-object/affiliate-request-details-status');
const PolicyType = require('../model/value-object/policy-type');
const policyHelper = require('../lib/helpers/policy-helper');

const Op = Sequelize.Op;
const { Container, Service } = typedi;
const { QueueOptions, Job } = Queue;

class PolicyData {

  constructor({
    stakerId,
    amount,
    affiliateRequestDetails,
    referrerList,
    policy,
    affiliateTypeId,
  }) {

    this.stakerId = stakerId;
    this.amount = amount;
    this.affiliateRequestDetails = affiliateRequestDetails;
    this.referrerList = referrerList;
    this.policy = policy;
    this.affiliateTypeId = affiliateTypeId;
    this.rewards = [];
  }
}

class CalculateRewardsProcessor {

  constructor(job) {
    this.logger = Container.get('logger');
    this.redisCacherService = Container.get('redisCacherService');
    this.affiliateRequestService = Container.get(AffiliateRequestService);
    this.clientService = Container.get(ClientService);
    this.clientAffiliateService = Container.get(ClientAffiliateService);
    this.policyService = Container.get(PolicyService);

    this.job = job;
    this.data = job.data;
  }

  async process() {
    const { logger, job } = this;
    const affiliateRequestId = this.data.id;
    const jobName = affiliateRequestId;
    logger.debug(`CalculateRewardsProcessor ${jobName} is processing. Data: ${JSON.stringify(this.data)}`);

    const affiliateRequest = await this.affiliateRequestService.findOne({
      id: affiliateRequestId,
      status: {
        [Op.not]: AffiliateRequestStatus.COMPLETED,
      }
    });

    if (!affiliateRequest) {
      logger.warn('Affiliate request %s is not active', jobName);

      return this.jobResult();
    }

    logger.info('Job %s start', jobName);
    await this.affiliateRequestService.updateWhere({
      id: affiliateRequestId,
    }, {
      status: AffiliateRequestStatus.PROCESSING,
    });

    try {
      await this.processRequest(affiliateRequest);
    } catch (err) {
      this.logger.error(err);

      try {
        await this.affiliateRequestService.updateWhere({
          id: affiliateRequestId,
        }, {
          status: AffiliateRequestStatus.FAILED,
          error_message: err.message,
        });
        // eslint-disable-next-line no-empty
      } catch (_) { }

      throw err;
    }

    logger.info('Affiliate request %s completed', jobName);
    await this.affiliateRequestService.updateWhere({
      id: affiliateRequestId,
    }, {
      status: AffiliateRequestStatus.COMPLETED,
    });

    return this.jobResult();
  }

  async processRequest(affiliateRequest) {
    const affiliateRequestDetailsList = await this.affiliateRequestService.getDetails(
      affiliateRequest.id,
      [
        AffiliateRequestDetailsStatus.PENDING,
        AffiliateRequestDetailsStatus.PROCESSING,
        AffiliateRequestDetailsStatus.FAILED,
      ],
    );
    this.logger.info(`There are ${affiliateRequestDetailsList.length} request details that is not completed.`);

    await forEachSeries(affiliateRequestDetailsList, async (affiliateRequestDetails) => {
      await this.processAffiliateRequestDetails(affiliateRequest, affiliateRequestDetails);
    });
  }

  async processAffiliateRequestDetails(affiliateRequest, affiliateRequestDetails) {
    const { logger, affiliateRequestService, clientAffiliateService, redisCacherService, policyService } = this;
    const { affiliate_type_id } = affiliateRequest;
    const { id, client_affiliate_id, affiliate_request_id, amount } = affiliateRequestDetails;

    const stakerId = client_affiliate_id;

    logger.debug(`Processing request details with id: ${id}, stakerId: ${stakerId}.`);
    await affiliateRequestService.setRequestDetailsStatus(id, AffiliateRequestDetailsStatus.PROCESSING);

    const clientAffiliate = await clientAffiliateService.findByPk(client_affiliate_id);
    const referrerList = await clientAffiliateService.getReferrerList(clientAffiliate);
    logger.debug('Referrer list: ', referrerList.map(item => item.id));

    const rootClientAffiliate = referrerList.find((item) => item.level === 1);
    if (!rootClientAffiliate) {
      throw new Error('Can not find root client for client who has id: ', client_affiliate_id);
    }

    const { policies } = await policyHelper.getPolicyForRootClient({
      rootClientAffiliateId: rootClientAffiliate.id,
      affiliateTypeId: rootClientAffiliate.affiliate_type_id,
      clientAffiliateService,
    });

    const policyDataList = policies.map((policy) => {
      const policyData = new PolicyData({
        stakerId,
        amount,
        affiliateRequestDetails,
        referrerList,
        policy,
        affiliateTypeId: affiliate_type_id,
      });

      return policyData;
    });

    const allRewardList = await this.calculateRewards(policyDataList);
    await this.saveRewards(allRewardList);

    throw new Error('AAA');
    // await affiliateRequestService.setRequestDetailsStatus(id, AffiliateRequestDetailsStatus.COMPLETED);
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
    const { stakerId, amount, affiliateRequestDetails, referrerList, policy, affiliateTypeId } = policyData;
    this.logger.debug(`Processing membership policy for staker ${stakerId} with amount ${amount}.\n`, policy.get({ plain: true }));
    const { max_levels, proportion_share, membership_rate } = policy;
    const rewardList = [];

    // Get rate for memberhip clients
    const { clientService } = this;
    const membershipType = await clientService.getMembershipType(stakerId, affiliateTypeId);
    this.logger.debug(`MembershipType: ${membershipType ? membershipType : 'NA'} .`);
    if (!membershipType) {
      return rewardList;
    }

    const rate = membership_rate[membershipType.toUpperCase()];
    if (_.isUndefined(rate)) {
      this.logger.warn('Can not get rate for membership: ', membershipType);
      return rewardList;
    }

    const shareAmount = Decimal(amount).times(proportion_share / 100);

    rewardList.push({
      client_id: stakerId,
      affiliate_request_id: affiliateRequestDetails.affiliate_request_id,
      affiliate_request_details_id: affiliateRequestDetails.id,
      policy_id: policy.id,
      policy_type: PolicyType.MEMBERSHIP,
      amount: shareAmount.times(rate / 100).toDecimalPlaces(8).toNumber(),
    });

    this.logger.debug('Output: ', rewardList);

    return rewardList;
  }

  async processMembershipAffiliatePolicy(policyData) {
    const { stakerId, amount, affiliateRequestDetails, referrerList, policy, affiliateTypeId } = policyData;
    this.logger.debug(`Processing membership policy for staker ${stakerId} with amount ${amount}.\n`, policy.get({ plain: true }));
    const { max_levels, proportion_share, membership_rate } = policy;
    const rewardList = [];

    // Get rate for memberhip clients
    const { clientService } = this;
    const membershipType = await clientService.getMembershipType(stakerId, affiliateTypeId);
    this.logger.debug(`MembershipType: ${membershipType ? membershipType : 'NA'} .`);
    if (!membershipType) {
      return rewardList;
    }

    const rate = membership_rate[membershipType.toUpperCase()];
    if (_.isUndefined(rate)) {
      this.logger.warn('Can not get rate for membership: ', membershipType);
      return rewardList;
    }

    const shareAmount = Decimal(amount).times(proportion_share / 100);

    rewardList.push({
      client_id: stakerId,
      affiliate_request_id: affiliateRequestDetails.affiliate_request_id,
      affiliate_request_details_id: affiliateRequestDetails.id,
      policy_id: policy.id,
      policy_type: PolicyType.MEMBERSHIP_AFFILIATE,
      amount: shareAmount.times(rate / 100).toDecimalPlaces(8).toNumber(),
    });

    this.logger.debug('Output: ', rewardList);

    return rewardList;
  }

  async processAffliatePolicy(policyData) {
    const { stakerId, amount, affiliateRequestDetails, referrerList, policy } = policyData;
    this.logger.debug(`Processing affliate policy for staker ${stakerId} with amount ${amount}.\n`, policy.get({ plain: true }));

    const { max_levels, rates, proportion_share } = policy;
    const shareAmount = Decimal(amount).times(proportion_share / 100);
    const rewardList = [];

    _.zip(referrerList, rates).forEach((arrays) => {
      const [referrer, rate] = arrays;

      if (referrer && rate) {
        rewardList.push({
          client_id: referrer.id,
          affiliate_request_id: affiliateRequestDetails.affiliate_request_id,
          affiliate_request_details_id: affiliateRequestDetails.id,
          policy_id: policy.id,
          policy_type: PolicyType.AFFILIATE,
          amount: shareAmount.times(rate / 100).toDecimalPlaces(8).toNumber(),
        });
      }
    });

    this.logger.debug('Output: ', rewardList);
    return rewardList;
  }

  async saveRewards(rewardList) {
    // this.logger.debug('Save rewards into database.', rewardList);
  }

  jobResult() {
    return Promise.resolve({
      data: this.job.data,
      worker: process.pid,
    });
  }

}

const processJob = async (job) => {
  const jobProcessor = new CalculateRewardsProcessor(job);

  await jobProcessor.process();
};

module.exports = processJob;
