const _ = require('lodash');
const typedi = require('typedi');
const Sequelize = require('sequelize');
const BaseService = require('./base-service');
const ClientAffiliate = require('app/model').client_affiliates;
const Client = require('app/model').clients;
const AffiliateCode = require('app/model').affiliate_codes;
const Policy = require('app/model').policies;
const db = require('app/model').sequelize;
const { policyHelper, clientHelper } = require('app/lib/helpers');

const Op = Sequelize.Op;
const { Container, Service } = typedi;

class _ClientAffiliateService extends BaseService {

  constructor() {
    super(ClientAffiliate, 'ClientAffiliate');

    this.logger = Container.get('logger');
    this.redisCacherService = Container.get('redisCacherService');
  }

  create(data, options) {
    options = options || {};

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.model.create(data, {
          include: [
            {
              model: AffiliateCode,
              as: 'affiliateCodes'
            },
          ],
          transaction: options.transaction,
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  findByPk(id, opts) {
    opts = opts || {};
    const { isIncludePolicies } = opts;

    return new Promise(async (resolve, reject) => {
      try {
        const options = {
          include: [],
        };

        if (isIncludePolicies) {
          options.include.push({
            model: Policy,
            as: 'ClientPolicies',
          });
        }

        const result = await this.model.findByPk(id, options);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  findByExtClientIdAndAffiliateTypeId(extClientId, affiliateTypeId) {
    return new Promise(async (resolve, reject) => {
      try {
        const client = await Client.findOne({
          where: {
            ext_client_id: extClientId,
          },
          include: [{
            as: 'ClientAffiliates',
            model: ClientAffiliate,
            where: {
              affiliate_type_id: affiliateTypeId,
            }
          }]
        });
        const result = client ? client.ClientAffiliates[0] : null;

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getReferrerList(client) {
    if (!client.referrer_client_affiliate_id) {
      return [];
    }

    const { id, parent_path, root_client_affiliate_id } = client;
    const stakerId = id;

    const key = this.redisCacherService.getCacheKey('referrer-list', { stakerId });
    let referrerList = await this.redisCacherService.get(key);
    if (referrerList) {
      return referrerList;
    }

    const query = `
      SELECT id, client_id, affiliate_type_id, referrer_client_affiliate_id, "level", parent_path, root_client_affiliate_id, actived_flg, created_at, updated_at
      FROM public.client_affiliates
      WHERE (
        (
          parent_path @> :parent_path and root_client_affiliate_id = :root_client_affiliate_id
        )
        OR
        (
          id = :root_client_affiliate_id
        )
      )
      ORDER BY "level" DESC
    `;
    const clientResult = await db.query(query,
      {
        replacements: {
          root_client_affiliate_id,
          parent_path,
        },
      },
      {
        model: ClientAffiliate,
        mapToModel: true,
        type: db.QueryTypes.SELECT,
      });

    const clientAffiliateList = clientResult[0];
    const cacheClients = _.reduce(clientAffiliateList, (val, item) => {
      val[item.id] = item;

      return val;
    }, {});

    // Find refferer
    clientAffiliateList.forEach((item) => {
      item.reffererInfo = item.referrer_client_affiliate_id ? cacheClients[item.referrer_client_affiliate_id] : null;
    });

    // Get referrer list
    referrerList = [];
    let refferer = cacheClients[client.referrer_client_affiliate_id];

    while (refferer) {
      referrerList.push(refferer);

      refferer = refferer.reffererInfo;
    }

    const result = referrerList.map((item) => {
      return {
        id: Number(item.id),
        affiliate_type_id: item.affiliate_type_id,
        level: item.level,
        root_client_id: item.root_client_id,
        referrer_client_affiliate_id: item.referrer_client_affiliate_id,
        policy_id: item.policy_id,
        actived_flg: item.actived_flg,
      };
    });

    const ttlInSeconds = 60;
    await this.redisCacherService.set(key, result, ttlInSeconds);

    return result;
  }

  async getDescendants(clientAffiliate) {
    if (clientAffiliate.level === 1) {
      return this.getDescendantsForRoot(clientAffiliate);
    }

    return new Promise(async (resolve, reject) => {
      try {
        const { id, parent_path, root_client_affiliate_id } = clientAffiliate;
        const query = `
        SELECT id, client_id, affiliate_type_id, referrer_client_affiliate_id, "level", parent_path, root_client_affiliate_id, actived_flg, created_at, updated_at
        FROM public.client_affiliates
        WHERE (
          (
            parent_path <@ :parent_path
            AND root_client_affiliate_id = :root_client_affiliate_id
          )
        )
        ORDER BY "level" DESC
      `;

        const orgUnitResult = await db.query(query,
          {
            replacements: {
              root_client_affiliate_id,
              parent_path: `${clientAffiliate.parent_path}.${clientAffiliate.id}`,
            },
          },
          {
            model: ClientAffiliate,
            mapToModel: true,
            type: db.QueryTypes.SELECT,
          });

        const items = orgUnitResult[0].concat(clientAffiliate);
        const orgUnitCache = _.reduce(items, (val, item) => {
          val[item.id] = item;
          item.children = [];

          return val;
        }, {});

        // Find parents
        items.forEach((item) => {
          item.parent = item.referrer_client_affiliate_id ? orgUnitCache[item.referrer_client_affiliate_id] : null;

          if (item.parent) {
            item.parent.children.push(item);
          }
        });

        let result = [];
        clientHelper.treeToList(clientAffiliate, result, null);
        result = result.filter(x => x.id !== clientAffiliate.id);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getDescendantsForRoot(clientAffiliate) {
    return new Promise(async (resolve, reject) => {
      try {
        const cond = {
          root_client_affiliate_id: clientAffiliate.id,
        };
        const result = await this.findAll(cond);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getNumOfReferences(client_affiliate_id) {
    return this.count({
      referrer_client_affiliate_id: client_affiliate_id,
    });
  }

}

const ClientAffiliateService = Service([], () => {
  const service = new _ClientAffiliateService();

  return service;
});

module.exports = ClientAffiliateService;
