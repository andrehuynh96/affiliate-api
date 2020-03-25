const typedi = require('typedi');
const shortid = require('shortid');
const BaseService = require('./base-service');
const AffiliateType = require('app/model').affiliate_types;
const Policy = require('app/model').policies;

const Service = typedi.Service;

class _AffiliateTypeService extends BaseService {
  constructor() {
    super(AffiliateType, 'AffiliateType');
  }

  findByPk(id, { isIncludePolicies }) {
    if (!isIncludePolicies) {
      return super.findByPk(id);
    }

    return new Promise(async (resolve, reject) => {
      try {
        const options = {
          include: [],
        };

        if (isIncludePolicies) {
          options.include.push({
            model: Policy,
            as: 'DefaultPolicies',
          });
        }

        const result = await this.model.findByPk(id, options);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

}

const AffiliateTypeService = Service([], () => {
  const service = new _AffiliateTypeService();

  return service;
});

module.exports = AffiliateTypeService;
