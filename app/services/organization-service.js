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

}

const OrganizationService = Service([], () => {
  const service = new _OrganizationService();

  return service;
});

module.exports = OrganizationService;
