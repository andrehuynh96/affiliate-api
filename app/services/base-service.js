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

  findOrCreate(cond, defaultData) {
    cond = cond || {};

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findOrCreate({
          where: cond,
          defaults: defaultData,
        });

        resolve(result[0]);
      } catch (err) {
        reject(err);
      }
    });
  }

  create(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.create(data);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  updateWhere(cond, data) {
    cond = cond || {};

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.update(data, {
          where: cond,
          returning: true
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  async update(instance) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await instance.update();

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  deleteWhere(cond, defaultData) {
    cond = cond || {};

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.destroy({
          where: cond,
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  delete(instance) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await instance.destroy();

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  deleteByPk(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const instance = await this.findByPk(id);

        return instance ? this.delete(instance) : null;
      } catch (err) {
        reject(err);
      }
    });

  }

}

module.exports = BaseService;
