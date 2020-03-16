const _ = require('lodash');
// import { Service } from 'typedi';

class BaseService {

  modelName;
  model;
  // protected logger: Logger;

  constructor(model, modelName) {
    this.model = model;
    this.modelName = modelName;

    // this.logger = containerHelper.getLogger();
  }


  /*
  async find(cond?: any): Promise<Array<InstanceType<ISchema>>> {
    return new Promise<Array<InstanceType<ISchema>>>(async (resolve, reject) => {
      try {
        const result = await this.model.find(cond);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  async findById(id: any): Promise<InstanceType<ISchema> | undefined> {
    return new Promise<InstanceType<ISchema>>(async (resolve, reject) => {
      try {
        const result = await this.model.findById(id);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  async findOne(cond: any): Promise<InstanceType<ISchema> | undefined> {
    return new Promise<InstanceType<ISchema>>(async (resolve, reject) => {
      try {
        if (cond.id) {
          cond._id = cond.id;
          delete cond.id;
        }

        const result = await this.model.findOne(cond);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  async create(instant: ISchema | any): Promise<InstanceType<ISchema>> {
    return new Promise<InstanceType<ISchema>>(async (resolve, reject) => {
      try {
        const result = await this.model.create(instant);

        resolve(result);
      } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
          // return reject(createHttpError(409, 'Duplicate key'));
          return reject(err);
        }

        reject(err);
      }
    });
  }

  async update(instant: ISchema): Promise<InstanceType<ISchema>> {
    const id = instant.id;

    return this.updateOne(id, instant);
  }

  async updateOne(id: any | string, body: any): Promise<InstanceType<ISchema>> {
    return new Promise<InstanceType<ISchema>>(async (resolve, reject) => {
      const updateData = _.omit(body, ['id']);
      let cond: any = id;

      if (_.isString(id) || ObjectId.isValid(id)) {
        cond = { _id: id };
      }

      return this.model.findOneAndUpdate(cond,
        {
          $inc: { __v: 1 },
          $set: updateData,
        }
        , {
          new: true,
          select: {},
        })
        .then((result: InstanceType<ISchema>) => {
          resolve(result);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  async delete(id: any): Promise<InstanceType<ISchema>> {
    return new Promise<InstanceType<ISchema>>(async (resolve, reject) => {
      return this.model.findByIdAndRemove({ _id: id })
        .then((result: InstanceType<ISchema>) => {
          resolve(result);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
*/

}

module.exports = BaseService;
