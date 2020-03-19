const typedi = require('typedi');
const shortid = require('shortid');
const BaseService = require('./base-service');
const AffiliateCode = require('app/model').affiliate_codes;
const Client = require('app/model').clients;

const Service = typedi.Service;

class _AffiliateCodeService extends BaseService {
  constructor() {
    super(AffiliateCode, 'AffiliateCode');
  }

  generateCode() {
    return shortid.generate().replace('_', '1').replace('-', '2');
  }

  findByPk(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findByPk(id, {
          include: [
            {
              model: Client,
              as: 'owner'
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

const AffiliateCodeService = Service([], () => {
  const service = new _AffiliateCodeService();

  return service;
});

module.exports = AffiliateCodeService;
