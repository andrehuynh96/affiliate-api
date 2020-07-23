const BaseService = require('./base-service');
const AffiliateCodeService = require('./affiliate-code-service');
const AffiliateTypeService = require('./affiliate-type-service');
const AppService = require('./app-service');
const ClientService = require('./client-service');
const ClientAffiliateService = require('./client-affiliate-service');
const PolicyService = require('./policy-service');
const AffiliateRequestService = require('./affiliate-request-service');
const RedisCacherService = require('./redis-cacher-service');
const RewardService = require('./reward-service');
const ClaimRewardService = require('./claim-reward-service');
const LockService = require('./lock-service');
const OrganizationService = require('./organization-service');
const PluTXUserIDService = require('./plutx-userid-service');
const AffiliateCodeStatisticsService = require('./affiliate-code-statisticss-service');
const MembershipTypeService = require('./membership-type-service');
const AffiliateRequestDetailService = require('./affiliate-request-detail-service');
module.exports = {
  AffiliateCodeService,
  AffiliateTypeService,
  AppService,
  ClientService,
  ClientAffiliateService,
  PolicyService,
  AffiliateRequestService,
  RedisCacherService,
  LockService,
  RewardService,
  ClaimRewardService,
  OrganizationService,
  PluTXUserIDService,
  AffiliateCodeStatisticsService,
  MembershipTypeService,
  AffiliateRequestDetailService
};
