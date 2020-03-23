const _ = require('lodash');
const typedi = require('typedi');
const Sequelize = require('sequelize');
const BaseService = require('./base-service');
const Client = require('app/model').clients;
const AffiliateCode = require('app/model').affiliate_codes;
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

  create(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.create(data, {
          include: [
            {
              model: AffiliateCode,
              as: 'affiliateCodes'
            },
          ]
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  findById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findByPk(id, {
          include: [
            {
              model: Policy,
              as: 'policy',
              foreignKey: 'policy_id',
            },
          ]
        });

        // console.log(result.get({
        //   plain: true
        // }));
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  findByIdList(idList, affiliateTypeId) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.findAll({
          where: {
            affiliate_type_id: affiliateTypeId,
            user_id: {
              [Op.in]: idList
            }
          }
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getReferrerList(client) {
    if (!client.referrer_client_id) {
      return [];
    }

    const { id, parent_path, root_client_id } = client;
    const stakerId = id;

    const key = this.redisCacherService.getCacheKey('referrer-list', { stakerId });
    let referrerList = await this.redisCacherService.get(key);
    if (referrerList) {
      return referrerList;
    }

    const query = `
      SELECT id, user_id, affiliate_type_id, referrer_client_id, "level", parent_path, root_client_id,policy_id, actived_flg, created_at, updated_at
      FROM public.clients
      where (
        (
          parent_path @> :parent_path and root_client_id = :root_client_id
        )
        OR
        (
          id = :root_client_id
        )
      )
      ORDER BY "level" DESC
    `;
    const clientResult = await db.query(query,
      {
        replacements: {
          root_client_id,
          parent_path,
        },
      },
      {
        model: Client,
        mapToModel: true,
        type: db.QueryTypes.SELECT,
      });

    const clientList = clientResult[0];
    const cacheClients = _.reduce(clientList, (val, item) => {
      val[item.id] = item;

      return val;
    }, {});

    // Find refferer
    clientList.forEach((item) => {
      item.reffererInfo = item.referrer_client_id ? cacheClients[item.referrer_client_id] : null;
    });

    // Get referrer list
    referrerList = [];
    let refferer = cacheClients[client.referrer_client_id];

    while (refferer) {
      referrerList.push(refferer);

      refferer = refferer.reffererInfo;
    }

    const result = referrerList.map((item) => {
      return {
        id: item.id,
        affiliate_type_id: item.affiliate_type_id,
        level: item.level,
        root_client_id: item.root_client_id,
        referrer_client_id: item.referrer_client_id,
        policy_id: item.policy_id,
        actived_flg: item.actived_flg,
      };
    });

    const ttlInSeconds = 60;
    await this.redisCacherService.set(key, result, ttlInSeconds);

    return result;
  }


}

const ClientService = Service([], () => {
  const service = new _ClientService();

  return service;
});

module.exports = ClientService;
