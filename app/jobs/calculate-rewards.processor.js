const _ = require('lodash');
const { forEach, forEachSeries } = require('p-iteration');
const typedi = require('typedi');
const Queue = require('bull');
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
const PolicyType = require('../model/value-object/policy-type');
const CommissonType = require('../model/value-object/commisson-type');
const policyHelper = require('../lib/helpers/policy-helper');
const CalculateRewards = require('./calculate-rewards');

const Op = Sequelize.Op;
const sequelize = db.sequelize;
const { Container, Service } = typedi;
const { QueueOptions, Job } = Queue;
const ROUND_DECIMAL_DIGITS = 10;

class CalculateRewardsProcessor {

  constructor(job) {
    this.logger = Container.get('logger');
    this.redisCacherService = Container.get('redisCacherService');
    this.affiliateRequestService = Container.get(AffiliateRequestService);
    this.clientService = Container.get(ClientService);
    this.clientAffiliateService = Container.get(ClientAffiliateService);
    this.affiliateTypeService = Container.get(AffiliateTypeService);
    this.policyService = Container.get(PolicyService);
    this.rewardService = Container.get(RewardService);

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
      job_id: null,
      error_message: null,
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
    const { logger, affiliateRequestService, clientAffiliateService, redisCacherService, policyService, affiliateTypeService } = this;

    await affiliateRequestService.setRequestDetailsStatus(affiliateRequestDetails.id, AffiliateRequestDetailsStatus.PROCESSING);
    const calculateRewards = new CalculateRewards();
    const allRewardList = await calculateRewards.getRewardList({
      affiliateTypeId: affiliateRequest.affiliate_type_id,
      currencySymbol: affiliateRequest.currency_symbol,
      affiliateRequestDetails
    });

    // throw new Error('AAA');
    const transaction = await db.sequelize.transaction();
    try {
      await this.saveRewards(allRewardList, transaction);
      await affiliateRequestService.setRequestDetailsStatus(affiliateRequestDetails.id, AffiliateRequestDetailsStatus.COMPLETED, transaction);

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();

      throw err;
    }
  }

  async saveRewards(rewardList, transaction) {
    const { rewardService } = this;
    await rewardService.bulkCreate(rewardList, { transaction });
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
