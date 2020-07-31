const typedi = require('typedi');
const BaseService = require('./base-service');
const MembershipTypeModel = require('app/model').membership_types;

const Service = typedi.Service;

class _MembershipTypeService extends BaseService {
  constructor() {
    super(MembershipTypeModel, 'MembershipType');
  }

}

const MembershipTypeService = Service([], () => {
  const service = new _MembershipTypeService();

  return service;
});

module.exports = MembershipTypeService;