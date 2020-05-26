const typedi = require('typedi');
const _ = require('lodash');
const Sequelize = require('sequelize');
const { forEach } = require('p-iteration');
const BaseService = require('./base-service');
const db = require('app/model');

const Op = Sequelize.Op;
const Service = typedi.Service;
const sequelize = db.sequelize;
const Organization = db.organizations;

class _OrganizationService extends BaseService {

  constructor() {
    super(Organization, 'Organization');
  }

  findByPk(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const cond = {
          where: {
            id: id,
            deleted_flg: false,
          }
        };
        const result = await this.model.findOne(cond);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }


}

const OrganizationService = Service([], () => {
  const service = new _OrganizationService();

  return service;
});

module.exports = OrganizationService;
