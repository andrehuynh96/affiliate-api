const typedi = require('typedi');
const BaseService = require('./base-service');
const Policy = require('app/model').policies;

const Service = typedi.Service;

class _PolicyService extends BaseService {
  constructor() {
    super(Policy, 'Policy');
  }

  // findByClientId(clientId) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const result = await ClientPolicy.findOne(
  //         {
  //           where: {
  //             client_id: clientId,
  //           }
  //         }, {
  //         include: [
  //           {
  //             association: Policy,
  //             as: 'policy',
  //             foreignKey: 'policy_id',
  //           },
  //         ]
  //       });

  //       console.info(clientId, result.policy);

  //       resolve(result.policy);
  //     } catch (err) {
  //       reject(err);
  //     }
  //   });
  // }

}

const PolicyService = Service([
], () => {
  const service = new _PolicyService();

  return service;
});

module.exports = PolicyService;
