const _ = require('lodash');
const { forEach, forEachSeries } = require('p-iteration');
const typedi = require('typedi');
const Queue = require('bull');
const { v4 } = require('uuid');
const config = require('../config');
const AffiliateCode = require('../model').affiliate_codes;
const {
  AffiliateCodeService,
  AffiliateRequestService,
  ClientService,
} = require('../services');
const AffiliateRequestStatus = require('../model/value-object/affiliate-request-status');
// import { LockService } from '../lib/services/lock-service';
// import { Lock } from 'redlock';

const { Container, Service } = typedi;
const { QueueOptions, Job } = Queue;

class CalculateRewardsProcessor {

  constructor(job) {
    this.logger = Container.get('logger');
    this.affiliateRequestService = Container.get(AffiliateRequestService);
    this.clientService = Container.get(ClientService);

    this.job = job;
    this.data = job.data;
    this.id = v4();
  }

  async process() {
    const { logger, job } = this;
    const jobName = job.name;
    // let lock: Lock;
    logger.debug(`CalculateRewardsProcessor ${jobName} is processing. Data: %o`);

    // // only monitor new blocks of active blockchain
    const affiliateRequestId = this.data.id;
    const affiliateRequest = await this.affiliateRequestService.findOne({
      id: affiliateRequestId,
      status: AffiliateRequestStatus.PENDING,
    });

    if (!affiliateRequest) {
      logger.warn('Affiliate request %s is not active', jobName);

      return this.jobResult();
    }

    // // Prevent job which has same name run pararell
    // const ressourceId = _.kebabCase(job.name);
    // const ttl = 3 * 60 * 1000;
    // // eslint-disable-next-line prefer-const
    // lock = await this.lockService.lockRessource(ressourceId, ttl);

    // logger.info('Job %s start', jobName);
    // let statusCode: number;

    // const mode = this.getMode(jobInfo);
    // const config = await this.jobInfoService.getConfig(jobInfo.config, mode);
    // config.jobId = jobId;
    // config.jobName = jobName;

    // const childProcess = pipelineRunner(mode, config, this.logger, (err: any, event: IChildToParentEvent) => {
    //   this.processCallbackFromChildProcess(err, event, jobInfo);
    // });

    // jobInfo.status = JobStatus.InProcess;
    // jobInfo.runAt = new Date();
    // jobInfo.processId = childProcess.pid;
    // const updateObj1 = _.pick(jobInfo, ['status', 'runAt', 'processId']);
    // await this.jobInfoService.updateOne(jobInfo.id, updateObj1);

    // // eslint-disable-next-line prefer-const
    // statusCode = await this.waitEndingProcess(childProcess);
    // await this.unLock(lock);

    // // Has critical error
    // if (statusCode) {
    //   jobInfo.status = JobStatus.Failed;
    //   jobInfo.exitCode = statusCode;
    //   jobInfo.processId = null;
    //   const updateObj = _.pick(jobInfo, ['status', 'exitCode', 'processId']);

    //   await this.jobInfoService.updateOne(jobInfo.id, updateObj);

    //   throw Error('Job failed!');
    // }

    logger.info('Affiliate request %s completed', jobName);
    // jobInfo.status = JobStatus.Completed;
    // jobInfo.finishedAt = new Date();
    // jobInfo.exitCode = statusCode;
    // jobInfo.processId = null;
    // const updateObj = _.pick(jobInfo, ['status', 'finishedAt', 'exitCode', 'processId']);

    // await this.jobInfoService.updateOne(jobInfo.id, updateObj);
    await this.affiliateRequestService.updateWhere({
      id: affiliateRequestId,
    }, {
      status: AffiliateRequestStatus.COMPLETED,
    });

    return this.jobResult();
  }

  // private getMode(jobInfo: JobInfo) {
  //   return jobInfo.type.toString().toLowerCase();
  // }

  // private async processCallbackFromChildProcess(err: any, event: IChildToParentEvent, jobInfo: JobInfo) {
  //   if (err) {
  //     this.logger.info(err);

  //     jobInfo.lastError = err.message;
  //     const updateObj = _.pick(jobInfo, ['lastError']);

  //     await this.jobInfoService.updateOne(jobInfo.id, updateObj);

  //     return;
  //   }

  //   if (!event) {
  //     return;
  //   }

  //   // this.logger.info('%s', event.type);
  //   let lastMessage = '';

  //   if (event.type === FxEvents.SendNotification) {
  //     const notification = event.payload as INotification;
  //     lastMessage = notification.message;

  //     await this.sendNotification(notification);
  //   } else if (event.type === FxEvents.SaveNotificationLog) {
  //     await this.saveNotificationLog(event);
  //   } else if (event.type === FxEvents.JobLog) {
  //     await this.saveJobLog(event);
  //   } else if (event.type === FxEvents.MarketUpdate) {
  //     lastMessage = event.type + ' at ' + event.payload;
  //   }

  //   // Update last event
  //   if (lastMessage) {
  //     jobInfo.lastMessage = lastMessage;
  //     const updateObj = _.pick(jobInfo, ['lastMessage']);

  //     await this.jobInfoService.updateOne(jobInfo.id, updateObj);
  //   }
  // }

  // private async sendNotification(notification: INotification) {
  //   const data = {
  //     text: notification.message,
  //     parseMode: notification.parseMode,
  //     botName: notification.botName,
  //   };

  //   this.broker.call(ServiceActions.SendMessage, data);
  // }

  // private async saveNotificationLog(event: IChildToParentEvent) {
  //   const notificationLog = new NotificationLogModel(Object.assign({}, event.payload, {
  //     status: NotificationLogStatus.Pending,
  //   }));

  //   this.notificationLogService.create(notificationLog);
  // }

  // private async saveJobLog(event: IChildToParentEvent) {
  //   const jobLog = new JobLogModel(event.payload);

  //   this.jobLogService.create(jobLog);
  // }

  jobResult() {
    return Promise.resolve({
      data: this.job.data,
      worker: process.pid,
    });
  }

  // private async unLock(lock) {
  //   if (lock) {
  //     try {
  //       await this.lockService.unlockLock(lock);
  //     } catch (e) {
  //       this.logger.debug(e);
  //     }
  //   }
  // }

}

const processJob = async (job) => {
  const jobProcessor = new CalculateRewardsProcessor(job);

  await jobProcessor.process();
};

module.exports = processJob;
