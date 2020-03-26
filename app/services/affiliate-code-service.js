const typedi = require('typedi');
const shortid = require('shortid');
const BaseService = require('./base-service');
const AffiliateCode = require('app/model').affiliate_codes;
const ClientAffiliate = require('app/model').client_affiliates;

const Service = typedi.Service;

class _AffiliateCodeService extends BaseService {
  constructor() {
    super(AffiliateCode, 'AffiliateCode');
  }

  generateCode() {
    return shortid.generate().replace(/_/g, '1').replace(/\\-/g, '2');
  }

}

const AffiliateCodeService = Service([], () => {
  const service = new _AffiliateCodeService();

  return service;
});

module.exports = AffiliateCodeService;
