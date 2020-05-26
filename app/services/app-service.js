const typedi = require('typedi');
const BaseService = require('./base-service');
const AppModel = require('app/model').apps;

const Service = typedi.Service;

class _AppService extends BaseService {
  constructor() {
    super(AppModel, 'App');
  }

}

const AppService = Service([], () => {
  const service = new _AppService();

  return service;
});

module.exports = AppService;
