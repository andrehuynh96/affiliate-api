const typedi = require('typedi');
const BaseService = require('./base-service');
const Policy = require('app/model').policies;

const Service = typedi.Service;

class _PolicyService extends BaseService {

  constructor() {
    super(Policy, 'Policy');
  }

}

const PolicyService = Service([], () => {
  const service = new _PolicyService();

  return service;
});

module.exports = PolicyService;
