const BaseService = require('./base-service');
const AffiliateCodeService = require('./affiliate-code-service');
const AffiliateTypeService = require('./affiliate-type-service');
const AppService = require('./app-service');
const ClientService = require('./client-service');
const ClientAffiliateService = require('./client-affiliate-service');
const PolicyService = require('./policy-service');
const AffiliateRequestService = require('./affiliate-request-service');
const RedisCacherService = require('./redis-cacher-service');

module.exports = {
  AffiliateCodeService,
  AffiliateTypeService,
  AppService,
  ClientService,
  ClientAffiliateService,
  PolicyService,
  AffiliateRequestService,
  RedisCacherService,
};
