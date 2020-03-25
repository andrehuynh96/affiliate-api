const typedi = require('typedi');
const BaseService = require('./base-service');
const Policy = require('app/model').policies;

const Service = typedi.Service;

class _PolicyService extends BaseService {

  constructor() {
    super(Policy, 'Policy');
  }

  // getPoliciesByAffiliateTypeId(affiliateTypeId) {
  //   return new Promise(async (resolve, reject) => {
  //     try {

  //       const result = await this.model.findAll(id, {
  //         // include: [
  //         //   {
  //         //     model: Policy,
  //         //     as: 'policy',
  //         //     foreignKey: 'default_policy_id',
  //         //   },
  //         // ]
  //       });

  //       resolve(result);
  //     } catch (err) {
  //       reject(err);
  //     }
  //   });
  // }


}

const PolicyService = Service([], () => {
  const service = new _PolicyService();

  return service;
});

module.exports = PolicyService;
