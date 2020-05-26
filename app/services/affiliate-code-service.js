const _ = require('lodash');
const { Service } = require('typedi');
const shortid = require('shortid');
const BaseService = require('./base-service');
const AffiliateCode = require('app/model').affiliate_codes;

class _AffiliateCodeService extends BaseService {
  constructor() {
    super(AffiliateCode, 'AffiliateCode');
  }

  async generateCode() {
    let code = null;
    let affiliateCode = null;

    do {
      code = _.replace(_.replace(shortid.generate(), /_/g, 1), /-/g, 2);
      code = code.toUpperCase();

      affiliateCode = await this.findByPk(code);
    } while (affiliateCode);

    return code;
  }

  findByPk(code) {
    const cond = {
      code,
      deleted_flg: false,
    };

    return this.findOne(cond);
  }

}

const AffiliateCodeService = Service([], () => {
  const service = new _AffiliateCodeService();

  return service;
});

module.exports = AffiliateCodeService;
