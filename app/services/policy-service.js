const typedi = require('typedi');
const Sequelize = require('sequelize');
const BaseService = require('./base-service');
const Policy = require('app/model').policies;

const Op = Sequelize.Op;
const { Container, Service } = typedi;

class _PolicyService extends BaseService {

  constructor() {
    super(Policy, 'Policy');
  }

  findByPk(id) {
    const cond = {
      id: id,
      deleted_flg: false,
    };

    return this.findOne(cond);
  }

  findByIdList(idList) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findAll({
          where: {
            id: {
              [Op.in]: idList
            },
            deleted_flg: false,
          },
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

}

const PolicyService = Service([], () => {
  const service = new _PolicyService();

  return service;
});

module.exports = PolicyService;
