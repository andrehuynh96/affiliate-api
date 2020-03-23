const _ = require('lodash');
const { forEach, forEachSeries } = require('p-iteration');
const typedi = require('typedi');
const Queue = require('bull');
const { v4 } = require('uuid');
const Sequelize = require('sequelize');
const config = require('../config');
const {
  AffiliateCodeService,
  AffiliateRequestService,
  ClientService,
} = require('../services');
const AffiliateRequestStatus = require('../model/value-object/affiliate-request-status');
const AffiliateRequestDetailsStatus = require('../model/value-object/affiliate-request-details-status');

const Op = Sequelize.Op;
const { Container, Service } = typedi;
const { QueueOptions, Job } = Queue;

class CalculateRewardsProcessor {

  constructor(job) {
    this.logger = Container.get('logger');
    this.redisCacherService = Container.get('redisCacherService');
    this.affiliateRequestService = Container.get(AffiliateRequestService);
    this.clientService = Container.get(ClientService);

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
    const { logger, affiliateRequestService, redisCacherService } = this;
    const { id, client_id, affiliate_request_id, amount } = affiliateRequestDetails;

    logger.debug(`Processing request details with id: ${id}, clientId: ${client_id}.`);
    await affiliateRequestService.setRequestDetailsStatus(id, AffiliateRequestDetailsStatus.PROCESSING);

    const key = client_id;
    const client = await redisCacherService.get(key);
    // await redisCacherService.set(key, { a: 1 });


    await affiliateRequestService.setRequestDetailsStatus(id, AffiliateRequestDetailsStatus.COMPLETED);
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
