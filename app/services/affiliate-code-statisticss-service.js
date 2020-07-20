const _ = require('lodash');
const { Service } = require('typedi');
const BaseService = require('./base-service');
const AffiliateCodeStatistics = require('app/model').affiliate_code_statistics;

class _AffiliateCodeStatisticsService extends BaseService {
  constructor() {
    super(AffiliateCodeStatistics, 'AffiliateCodeStatistics');
  }

  findByPk(code) {
    const cond = {
      code,
      deleted_flg: false,
    };

    return this.findOne(cond);
  }

}

const AffiliateCodeStatisticsService = Service([], () => {
  const service = new _AffiliateCodeStatisticsService();

  return service;
});

module.exports = AffiliateCodeStatisticsService;
