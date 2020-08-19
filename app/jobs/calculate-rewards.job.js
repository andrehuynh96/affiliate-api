const _ = require('lodash');
const { forEach, forEachSeries } = require('p-iteration');
const typedi = require('typedi');
const Queue = require('bull');
const config = require('../config');
const AffiliateCode = require('../model').affiliate_codes;
const processJob = require('./calculate-rewards.processor');
const {
  AffiliateCodeService,
  AffiliateRequestService,
  ClientService,
  ClientAffiliateService,
  RewardService,
  ClaimRewardService,
  AffiliateTypeService,
} = require('app/services');
const AffiliateRequestStatus = require('app/model/value-object/affiliate-request-status');
const sleep = require('sleep');

const { Container, Service } = typedi;
const { QueueOptions, Job } = Queue;
const NUM_OF_CURRENT_JOBS = 50;

class _CalculateRewardsJob {

  constructor() {
    this.logger = Container.get('logger');

    this.queueName = 'calculate-rewards';
    this.opts = {
      limiter: {
        max: 20,      // Max number of jobs processed
        duration: 10 * 1000, // per duration in milliseconds
        bounceBack: true, // When jobs get rate limited, they stay in the waiting queue and are not moved to the delayed queue
      },
      redis: {
        host: config.bull.host,
        port: config.bull.port,
        password: config.bull.password,
        db: config.bull.db,
      },
      prefix: 'bull',
      settings: {
        lockDuration: 30 * 1000, // Key expiration time for job locks.
        stalledInterval: 30 * 1000, // How often check for stalled jobs (use 0 for never checking).
        // stalledInterval: 0, // How often check for stalled jobs (use 0 for never checking).
        maxStalledCount: 1000, // Max amount of times a stalled job will be re-processed.
        guardInterval: 5000, // Poll interval for delayed jobs and added jobs.
        retryProcessDelay: 5000, // delay before processing next job in case of internal error.
        backoffStrategies: {
          jitter: function (attemptsMade, err) {
            return 10 * 1000 + Math.random() * 500;
          }
        },
        drainDelay: 5, // A timeout for when the queue is in drained state (empty waiting for jobs).
      },
    };

    this.queue = new Queue(this.queueName, this.opts);
  }

  async init() {
    this.queue.on('active', (job, jobPromise) => {
      _.set(this.activeJobPromises, job.id + '', jobPromise);
    });

    this.queue.on('completed', (job) => {
      _.unset(this.activeJobPromises, job.id + '');
    });

    this.queue.on('stalled', (job) => {
      _.unset(this.activeJobPromises, job.id + '');
    });

    this.queue.on('failed', (job) => {
      _.unset(this.activeJobPromises, job.id + '');
    });
  }

  getActiveJobPromise(jobId) {
    return _.get(this.activeJobPromises, jobId);
  }

  async start() {
    this.queue.process('*', NUM_OF_CURRENT_JOBS, processJob);

    await this.restartFailedJobs();
    // await this.syncPendingJobs();

    // Local events pass the job instance...
    this.queue.on('progress', (job, progress) => {
      this.logger.info(`Job ${job.id} is ${progress}% ready!`);
    });

    this.queue.on('completed', (job, result) => {
      this.logger.info(`Job ${job.id} completed!`);
    });
  }

  async restartFailedJobs() {
    const jobs = await this.queue.getJobs(['failed', 'delayed']);

    await forEach(jobs, async (job) => {
      job.retry();
    });
  }

  async syncPendingJobs() {
    const affiliateRequestService = Container.get(AffiliateRequestService);
    const pendingRequests = await affiliateRequestService.findAll({
      status: AffiliateRequestStatus.PENDING,
    });

    await forEachSeries(pendingRequests, async (request) => {
      let job = await this.queue.getJob(request.job_id);
      if (!job) {
        job = await this.addJob(request);
        request.job_id = job.id + '';
        await affiliateRequestService.updateWhere(
          {
            id: request.id
          },
          {
            job_id: request.job_id,
          });

        sleep.msleep(100);
      }
    });
  }

  async getJobStatus(jobId) {
    const job = await this.queue.getJob(jobId);

    return job ? await job.getState() : null;
  }

  async addJob(affiliateRequest) {
    const jobOpts = {
      priority: 1,
      delay: 500,
      attempts: 1000,
      backoff: {
        type: 'fixed',
        delay: 5 * 1000,
      },
      lifo: false,
      // timeout: number; // The number of milliseconds after which the job should be fail with a timeout error [optional]
      removeOnComplete: true,
      removeOnFail: false,
      stackTraceLimit: 3,
    };

    const jobName = _.kebabCase(`${affiliateRequest.currency_symbol}-${affiliateRequest.id}`);
    const jobData = {
      id: affiliateRequest.id,
    };

    const job = await this.queue.add(jobName, jobData, jobOpts);

    return job;
  }

  async removeJob(jobId) {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      return false;
    }

    if (job.isActive()) {
      await job.discard();
      await job.releaseLock();
    }
    await job.remove();

    return true;
  }

}

const CalculateRewardsJob = Service([], () => {
  const service = new _CalculateRewardsJob();

  return service;
});


module.exports = CalculateRewardsJob;
