const _ = require('lodash');
const { Service } = require('typedi');
const shortid = require('shortid');
const BaseService = require('./base-service');
const AffiliateCode = require('app/model').affiliate_codes;

class _AffiliateCodeService extends BaseService {
  constructor() {
    super(AffiliateCode, 'AffiliateCode');
  }

  generateCode() {
    let code = _.replace(_.replace(shortid.generate(), '_', 1), '-', 2);

    code = code.toUpperCase();

    return code;
  }

}

const AffiliateCodeService = Service([], () => {
  const service = new _AffiliateCodeService();

  return service;
});

module.exports = AffiliateCodeService;
