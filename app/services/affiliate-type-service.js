const typedi = require('typedi');
const BaseService = require('./base-service');
const AffiliateType = require('app/model').affiliate_types;
const Policy = require('app/model').policies;

const Service = typedi.Service;

class _AffiliateTypeService extends BaseService {
  constructor() {
    super(AffiliateType, 'AffiliateType');
  }

  findByPk(id, opts) {
    opts = opts || {};
    const { isIncludePolicies } = opts;

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

        const result = await this.model.findOne({
          where: {
            id: id,
            deleted_flg: false,
          }
        }, options);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  findByIdAndOrganizationId(id, organizationId) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findOne({
          where: {
            id: id,
            deleted_flg: false,
            organization_id: organizationId,
          }
        });

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
