const typedi = require('typedi');
const BaseService = require('./base-service');
const Client = require('app/model').clients;
const AffiliateCode = require('app/model').affiliate_codes;
const Policy = require('app/model').policies;

const Service = typedi.Service;

class _ClientService extends BaseService {

  constructor() {
    super(Client, 'Client');
  }

  create(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.create(data, {
          include: [
            {
              model: AffiliateCode,
              as: 'affiliateCodes'
            },
          ]
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  findById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findByPk(id, {
          include: [
            {
              model: Policy,
              as: 'policy',
              foreignKey: 'policy_id',
            },
          ]
        });

        // console.log(result.get({
        //   plain: true
        // }));
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

}

const ClientService = Service([
], () => {
  const service = new _ClientService();

  return service;
});

module.exports = ClientService;
