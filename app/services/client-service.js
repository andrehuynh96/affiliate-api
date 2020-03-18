const typedi = require('typedi');
const BaseService = require('./base-service');
const Client = require('app/model').clients;
const AffiliateCode = require('app/model').affiliate_codes;

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

}

const ClientService = Service([
], () => {
  const service = new _ClientService();

  return service;
});

module.exports = ClientService;
