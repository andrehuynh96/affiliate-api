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

  findByIdList(extClientIdList, affiliateTypeId) {
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

  getExtClientIdMapping(extClientIdList, affiliateTypeId) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.findByIdList(extClientIdList, affiliateTypeId);
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

}

const ClientService = Service([], () => {
  const service = new _ClientService();

  return service;
});

module.exports = ClientService;
