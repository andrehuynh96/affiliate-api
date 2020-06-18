class BaseService {

  constructor(model, modelName) {
    this.model = model;
    this.modelName = modelName;
  }

  findAll(cond) {
    cond = cond || {};

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findAll({
          where: cond,
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  findByPk(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findByPk(id);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  findOne(cond) {
    cond = cond || {};

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findOne({
          where: cond,
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  findAndCountAll({ condition, offset, limit, order }) {
    condition = condition || {};
    order = order || [];

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findAndCountAll({
          where: condition,
          offset,
          limit,
          order,
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  count(cond) {
    cond = cond || {};

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.count({
          where: cond,
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  findOrCreate(cond, defaultData, options) {
    options = options || {};
    cond = cond || {};

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findOrCreate({
          where: cond,
          defaults: defaultData,
          transaction: options.transaction,
        });

        resolve(result[0]);
      } catch (err) {
        reject(err);
      }
    });
  }

  create(data, options) {
    options = options || {};

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.create(data, options);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  bulkCreate(items, options) {
    options = options || {};

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.bulkCreate(items, options);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  updateWhere(cond, data, options) {
    options = options || {};
    cond = cond || {};

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.update(data, {
          where: cond,
          transaction: options.transaction,
          returning: true
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  async update(instance, options) {
    options = options || {};

    return new Promise(async (resolve, reject) => {
      try {
        const result = await instance.save(options);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Hard delete
  deleteWhere(cond, transaction) {
    cond = cond || {};

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.destroy({
          where: cond,
          transaction: transaction,
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  delete(instance, transaction) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await instance.destroy({ transaction });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Hard delete
  deleteByPk(id, transaction) {
    return this.deleteWhere({ id }, transaction);
  }

}

module.exports = BaseService;
