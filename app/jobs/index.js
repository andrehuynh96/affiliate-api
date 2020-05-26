const typedi = require('typedi');
const logger = require('../lib/logger');
const CalculateRewardsJob = require('./calculate-rewards.job');

const { Container, Service } = typedi;

const startJobs = async () => {
  const calculateRewardsJob = Container.get(CalculateRewardsJob);
  Container.set('calculateRewardsJob', calculateRewardsJob);

  await calculateRewardsJob.init();
  await calculateRewardsJob.start();
};

module.exports = startJobs;
