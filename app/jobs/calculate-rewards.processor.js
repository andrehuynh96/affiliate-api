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
  ClientAffiliateService,
  PolicyService,
} = require('../services');
const AffiliateRequestStatus = require('../model/value-object/affiliate-request-status');
const AffiliateRequestDetailsStatus = require('../model/value-object/affiliate-request-details-status');
const policyHelper = require('../lib/helpers/policy-helper');

const Op = Sequelize.Op;
const { Container, Service } = typedi;
const { QueueOptions, Job } = Queue;

class CalculateRewardsProcessor {

  constructor(job) {
    this.logger = Container.get('logger');
    this.redisCacherService = Container.get('redisCacherService');
    this.affiliateRequestService = Container.get(AffiliateRequestService);
    this.ClientAffiliateService = Container.get(ClientAffiliateService);
    this.policyService = Container.get(PolicyService);

    this.job = job;
    this.data = job.data;
    // this.id = v4();
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
      await this.processAffiliateRequestDetails(affiliateRequestDetails);
    });
  }

  async processAffiliateRequestDetails(affiliateRequestDetails) {
    const { logger, affiliateRequestService, ClientAffiliateService, redisCacherService, policyService } = this;
    const { id, client_id, affiliate_request_id, amount } = affiliateRequestDetails;

    logger.debug(`Processing request details with id: ${id}, clientId: ${client_id}.`);
    await affiliateRequestService.setRequestDetailsStatus(id, AffiliateRequestDetailsStatus.PROCESSING);

    const client = await ClientAffiliateService.findById(client_id);
    const referrerList = await ClientAffiliateService.getReferrerList(client);
    logger.debug('Referrer list: ', referrerList.map(item => item.id));

    const rootClient = referrerList.find((item) => item.level === 1);
    if (!rootClient) {
      throw new Error('Can not find root client for client who has id: ', client_id);
    }

    const policy = await policyHelper.getPolicyForRootClient({
      affiliateTypeId: rootClient.affiliate_type_id,
      userPolicyId: rootClient.policy_id,
      policyService,
    });
    const { max_levels, rates } = policy;
    console.log(rates);
    const rewardList = [];

    _.zip(referrerList, rates).forEach((arrays) => {
      const [referrer, rate] = arrays;

      if (referrer && rate) {
        console.info(referrer, rate);
        // console.info(amount, rate);
        rewardList.push({
          client_id: referrer.id,
          affiliate_request_id,
          amount: Decimal(amount).times(rate / 100).toDecimalPlaces(8).toNumber(),
        });
      }
    });

    await this.saveRewards(rewardList);

    throw new Error('AAA');
    // await affiliateRequestService.setRequestDetailsStatus(id, AffiliateRequestDetailsStatus.COMPLETED);
  }

  async saveRewards(rewardList) {
    this.logger.debug('Referrer list: ', rewardList);
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
