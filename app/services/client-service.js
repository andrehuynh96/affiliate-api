const _ = require('lodash');
const typedi = require('typedi');
const Sequelize = require('sequelize');
const BaseService = require('./base-service');
const Client = require('app/model').clients;
const ClientAffiliate = require('app/model').client_affiliates;
const Policy = require('app/model').policies;
const db = require('app/model').sequelize;

const Op = Sequelize.Op;
const { Container, Service } = typedi;

class _ClientService extends BaseService {

  constructor() {
    super(Client, 'Client');

    this.logger = Container.get('logger');
    this.redisCacherService = Container.get('redisCacherService');
  }

  findByClientAffiliateId(clientAffiliateId, affiliateTypeId) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findOne({
          where: {
          },
          include: [{
            as: 'ClientAffiliates',
            model: ClientAffiliate,
            where: {
              id: clientAffiliateId,
              affiliate_type_id: affiliateTypeId,
            }
          }]
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  findByExtClientIdListAndAffiliateTypeId(extClientIdList, affiliateTypeId) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findAll({
          where: {
            ext_client_id: {
              [Op.in]: extClientIdList
            }
          },
          include: [{
            as: 'ClientAffiliates',
            model: ClientAffiliate,
            where: {
              affiliate_type_id: affiliateTypeId,
            }
          }]
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  findByIdList(idList) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findAll({
          where: {
            id: {
              [Op.in]: idList
            }
          },
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  getExtClientIdMapping(extClientIdList, affiliateTypeId) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.findByExtClientIdListAndAffiliateTypeId(extClientIdList, affiliateTypeId);
        const mapping = {};

        result.forEach((client) => {
          const clientAffiliate = client.ClientAffiliates[0];

          mapping[client.ext_client_id] = clientAffiliate ? clientAffiliate.id : null;
        });

        resolve(mapping);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getMembershipType(clientAffiliateId, affiliateTypeId) {
    const key = this.redisCacherService.getCacheKey('membership-type', { clientAffiliateId });
    let result = await this.redisCacherService.get(key);
    if (!_.isNull(result) && !_.isUndefined(result)) {
      return result;
    }

    const client = await this.model.findOne({
      include: [{
        as: 'ClientAffiliates',
        model: ClientAffiliate,
        where: {
          id: clientAffiliateId,
          affiliate_type_id: affiliateTypeId,
        }
      }]
    });

    result = client.membership_type_id || '';

    const ttlInSeconds = 60;
    await this.redisCacherService.set(key, result, ttlInSeconds);

    return result;
  }

}

const ClientService = Service([], () => {
  const service = new _ClientService();

  return service;
});

module.exports = ClientService;
