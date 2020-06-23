const typedi = require('typedi');
const _ = require('lodash');
const { forEach } = require('p-iteration');
const Sequelize = require('sequelize');
const db = require('app/model');
const {
  AffiliateCodeService,
  AffiliateTypeService,
  ClientService,
  ClientAffiliateService,
  PolicyService,
} = require('app/services');
const { policyHelper, clientHelper } = require('app/lib/helpers');
const PolicyType = require('app/model/value-object/policy-type');
const policyMapper = require('app/response-schema/policy.response-schema');
const inviteeMapper = require('app/response-schema/invitee.response-schema');
const clientMapper = require('app/response-schema/client.response-schema');

const Op = Sequelize.Op;
const sequelize = db.sequelize;
const { Container, Service } = typedi;

const controller = {
  create: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { body, affiliateTypeId, organizationId } = req;
      const { membership_type_id } = body;
      let { ext_client_id, affiliate_code } = body;
      ext_client_id = _.trim(ext_client_id).toLowerCase();
      affiliate_code = _.trim(affiliate_code).toUpperCase();

      const affiliateCodeService = Container.get(AffiliateCodeService);
      const clientAffiliateService = Container.get(ClientAffiliateService);
      const clientService = Container.get(ClientService);
      const affiliateTypeService = Container.get(AffiliateTypeService);
      let level = 1;
      let parentPath = 'root';
      let referrer_client_affiliate_id = null;
      let rootClientAffiliateId = null;
      let affiliateCodeInstance = null;
      let affiliatePolicy = null;
      let transaction = null;
      let referrerClientAffiliate;

      // Has refferer
      if (affiliate_code) {
        affiliateCodeInstance = await affiliateCodeService.findByPk(affiliate_code);

        if (!affiliateCodeInstance) {
          return res.notFound(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE', { fields: ['affiliate_code'] });
        }

        referrer_client_affiliate_id = affiliateCodeInstance.client_affiliate_id;
        referrerClientAffiliate = await affiliateCodeInstance.getOwner();

        if (!referrerClientAffiliate) {
          return res.notFound(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE', { fields: ['affiliate_code'] });
        }
      }

      try {
        let client = await clientService.findOne({
          ext_client_id,
          organization_id: organizationId,
        });

        let clientId = null;
        if (client) {
          // Check duplicate client
          clientId = client.id;
          const existClientAffiliate = await clientAffiliateService.findOne({
            client_id: clientId,
            affiliate_type_id: affiliateTypeId,
          });

          if (existClientAffiliate) {
            if (!membership_type_id) {
              return res.badRequest(res.__('REGISTER_CLIENT_DUPLICATE_EXT_CLIENT_ID'), 'REGISTER_CLIENT_DUPLICATE_EXT_CLIENT_ID', { fields: ['client_id'] });
            }

            // Update membership
            if (membership_type_id && client.membership_type_id !== membership_type_id) {
              await clientService.updateWhere(
                {
                  id: client.id
                },
                {
                  membership_type_id
                });
            }

            const affiliateCodes = await existClientAffiliate.getAffiliateCodes();

            return res.ok(affiliateCodes[0]);
          }
        } else {
          transaction = await db.sequelize.transaction();

          client = await clientService.create({
            ext_client_id,
            organization_id: organizationId,
            membership_type_id,
          }, { transaction });

          clientId = client.id;
        }

        if (!transaction) {
          transaction = await db.sequelize.transaction();
        }

        // Has refferer
        if (referrerClientAffiliate) {
          // Referrer code doesn't exist on system
          if (referrerClientAffiliate.affiliate_type_id !== affiliateTypeId) {
            referrerClientAffiliate = await clientAffiliateService.findOne({
              client_id: referrerClientAffiliate.client_id,
              affiliate_type_id: affiliateTypeId,
            });

            if (!referrerClientAffiliate) {
              const code = await affiliateCodeService.generateCode();
              const data = {
                client_id: referrerClientAffiliate.client_id,
                affiliate_type_id: affiliateTypeId,
                referrer_client_affiliate_id: null,
                level: 1,
                parent_path: 'root',
                root_client_affiliate_id: null,
                actived_flg: true,
                affiliateCodes: [{
                  code,
                  deleted_flg: false,
                }]
              };

              referrerClientAffiliate = await clientAffiliateService.create(data, { transaction });
            }
          }

          rootClientAffiliateId = referrerClientAffiliate.root_client_affiliate_id || referrerClientAffiliate.id;
          // Check max level that policy can set for users
          const { policies } = await policyHelper.getPolicies({
            affiliateTypeId,
            clientAffiliateService,
            affiliateTypeService,
            clientAffiliate: referrerClientAffiliate
          });

          if (!_.some(policies)) {
            await transaction.rollback();

            return res.notFound(res.__('NOT_FOUND_POLICY'), 'NOT_FOUND_POLICY');
          }

          affiliatePolicy = policies.find(x => x.type === PolicyType.AFFILIATE);
          if (!affiliatePolicy) {
            await transaction.rollback();

            return res.notFound(res.__('NOT_FOUND_POLICY'), 'NOT_FOUND_POLICY');
          }

          level = referrerClientAffiliate.level + 1;
          const maxLevels = affiliatePolicy.max_levels;

          if (maxLevels && level > maxLevels) {
            await transaction.rollback();
            const errorMessage = res.__('POLICY_LEVEL_IS_EXCEED', maxLevels);

            return res.forbidden(errorMessage, 'POLICY_LEVEL_IS_EXCEED', { fields: ['affiliate_code'] });
          }

          parentPath = `${referrerClientAffiliate.parent_path}.${referrerClientAffiliate.id}`;
        }

        // Update membership
        if (membership_type_id && client.membership_type_id !== membership_type_id) {
          await clientService.updateWhere(
            {
              id: client.id
            },
            {
              membership_type_id
            },
            { transaction });
        }

        const code = await affiliateCodeService.generateCode();
        const data = {
          client_id: clientId,
          affiliate_type_id: affiliateTypeId,
          referrer_client_affiliate_id: referrer_client_affiliate_id,
          level,
          parent_path: parentPath,
          root_client_affiliate_id: rootClientAffiliateId,
          actived_flg: true,
          affiliateCodes: [{
            code,
            deleted_flg: false,
          }]
        };

        const clientAffiliate = await clientAffiliateService.create(data, { transaction });
        await transaction.commit();

        return res.ok(clientAffiliate.affiliateCodes[0]);
      } catch (err) {
        if (transaction) {
          await transaction.rollback();
        }

        throw err;
      }
    }
    catch (err) {
      logger.error(err);
      next(err);
    }
  },

  search: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      const { query, affiliateTypeId, organizationId } = req;
      const { offset, limit } = query;
      const keyword = _.trim(query.keyword);
      logger.info('Client::search');

      const condition = {
        organization_id: organizationId,
      };
      if (keyword) {
        condition.name = {
          [Op.substring]: keyword,
        };
      }

      const off = parseInt(offset);
      const lim = parseInt(limit);
      const order = [['created_at', 'DESC']];
      const clientService = Container.get(ClientService);
      const { count: total, rows: items } = await clientService.findAndCountAll({ condition, offset: off, limit: lim, order });

      return res.ok({
        items: clientMapper(items),
        offset: off,
        limit: lim,
        total: total
      });
    }
    catch (err) {
      logger.error('search policys fail: ', err);
      next(err);
    }
  },

  setPolicies: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      logger.info('client::setPolicies');
      const { body, affiliateTypeId, organizationId } = req;
      const { affiliate_code } = body;
      const extClientId = _.trim(body.ext_client_id).toLowerCase();
      const { policies } = body;

      // Validate policies
      const policyService = Container.get(PolicyService);
      const policyIdList = _.uniq(policies);
      const { notFoundPolicyIdList, policyList } = await policyHelper.validatePolicyIdList(policyIdList, policyService);

      if (notFoundPolicyIdList.length > 0) {
        const errorMessage = res.__('CLIENT_SET_POLICIES_NOT_FOUND_POLICY_ID_LIST', notFoundPolicyIdList.join(', '));
        return res.badRequest(errorMessage, 'CLIENT_SET_POLICIES_NOT_FOUND_POLICY_ID_LIST', { fields: ['policies'] });
      }

      // Validate ext_client_id
      const clientService = Container.get(ClientService);
      const extClientIdList = [extClientId];
      const extClientIdMapping = await clientService.getExtClientIdMapping(extClientIdList, affiliateTypeId);
      const clientAffiliateId = extClientIdMapping[extClientId];

      if (!clientAffiliateId) {
        const errorMessage = res.__('NOT_FOUND_EXT_CLIENT_ID', extClientId);
        return res.badRequest(errorMessage, 'NOT_FOUND_EXT_CLIENT_ID', { fields: ['ext_client_id'] });
      }

      const clientAffiliateService = Container.get(ClientAffiliateService);
      const clientAffiliate = await clientAffiliateService.findByPk(clientAffiliateId);
      if (!clientAffiliate) {
        const errorMessage = res.__('NOT_FOUND_EXT_CLIENT_ID', extClientId);
        return res.badRequest(errorMessage, 'NOT_FOUND_EXT_CLIENT_ID', { fields: ['ext_client_id'] });
      }

      const transaction = await db.sequelize.transaction();
      try {
        const existPolicies = await clientAffiliate.getClientPolicies();
        await clientAffiliate.removeClientPolicies(existPolicies, { transaction });
        await clientAffiliate.addClientPolicies(policyList, { transaction });

        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        logger.error(err);
        throw err;
      }

      // return res.ok(mapper(policyList));
      return res.ok({ isSuccess: true });
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },

  updateAffiliateCode: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      logger.info('client::updateAffiliateCode');
      const { body, affiliateTypeId, organizationId } = req;
      const { ext_client_id, affiliate_code } = body;
      const extClientId = _.trim(ext_client_id).toLowerCase();
      const affiliateCode = _.trim(affiliate_code).toUpperCase();
      const clientService = Container.get(ClientService);
      const clientAffiliateService = Container.get(ClientAffiliateService);

      // Validate ext_client_id
      const extClientIdList = [extClientId];
      const extClientIdMapping = await clientService.getExtClientIdMapping(extClientIdList, affiliateTypeId);
      const clientAffiliateId = extClientIdMapping[extClientId];

      if (!clientAffiliateId) {
        const errorMessage = res.__('NOT_FOUND_EXT_CLIENT_ID', extClientId);
        return res.badRequest(errorMessage, 'NOT_FOUND_EXT_CLIENT_ID', { fields: ['ext_client_id'] });
      }

      const clientAffiliate = await clientAffiliateService.findByPk(clientAffiliateId);
      if (!clientAffiliate) {
        const errorMessage = res.__('NOT_FOUND_EXT_CLIENT_ID', extClientId);
        return res.badRequest(errorMessage, 'NOT_FOUND_EXT_CLIENT_ID', { fields: ['ext_client_id'] });
      }

      if (clientAffiliate.referrer_client_affiliate_id) {
        return res.forbidden(res.__('CLIENT_IS_ALREADY_UPDATED_REFERRAL_CODE'), 'CLIENT_IS_ALREADY_UPDATED_REFERRAL_CODE');
      }

      // Validate affiliate_code
      const affiliateCodeService = Container.get(AffiliateCodeService);
      const affiliateCodeInstance = await affiliateCodeService.findByPk(affiliateCode);

      if (!affiliateCodeInstance) {
        return res.badRequest(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE', { fields: ['affiliate_code'] });
      }

      const referrer_client_affiliate_id = affiliateCodeInstance.client_affiliate_id;
      const referrerClientAffiliate = await affiliateCodeInstance.getOwner();

      if (!referrerClientAffiliate) {
        return res.notFound(res.__('NOT_FOUND_REFERRER_USER'), 'NOT_FOUND_REFERRER_USER');
      }

      if (referrerClientAffiliate.affiliate_type_id !== affiliateTypeId) {
        return res.badRequest(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE', { fields: ['affiliate_code'] });
      }

      if (referrerClientAffiliate.id === clientAffiliate.id) {
        return res.forbidden(res.__('CLIENT_CAN_NOT_UPDATE_WITH_YOUR_REFERRAL_CODE'), 'CLIENT_CAN_NOT_UPDATE_WITH_YOUR_REFERRAL_CODE');
      }

      // Get children
      const cond = {
        root_client_affiliate_id: clientAffiliate.id,
        affiliate_type_id: affiliateTypeId,
      };
      const childClientAffiliateList = await clientAffiliateService.findAll(cond);

      if (childClientAffiliateList.length > 0) {
        const isInNetwork = childClientAffiliateList.some(x => x.id === referrerClientAffiliate.id);
        if (isInNetwork) {
          return res.forbidden(res.__('CLIENT_CAN_NOT_UPDATE_WITH_REFERRAL_CODE_IN_YOUR_AFFILIATE_NETWORK'), 'CLIENT_CAN_NOT_UPDATE_WITH_REFERRAL_CODE_IN_YOUR_AFFILIATE_NETWORK');
        }
      }

      const transaction = await db.sequelize.transaction();
      try {
        clientAffiliate.referrer_client_affiliate_id = referrerClientAffiliate.id;
        clientAffiliate.root_client_affiliate_id = referrerClientAffiliate.root_client_affiliate_id || referrerClientAffiliate.id;
        clientAffiliate.parent_path = `${referrerClientAffiliate.parent_path}.${referrerClientAffiliate.id}`;
        clientAffiliate.level = referrerClientAffiliate.level + 1;
        const updateClientAffiliateList = [clientAffiliate];

        if (childClientAffiliateList.length > 0) {
          const cacheClients = _.reduce(childClientAffiliateList, (val, item) => {
            val[item.id] = item;

            return val;
          }, {});
          cacheClients[clientAffiliate.id] = clientAffiliate;

          // Find refferer
          _.sortBy(childClientAffiliateList, (x => x.level)).forEach((item) => {
            item.parent = item.referrer_client_affiliate_id ? cacheClients[item.referrer_client_affiliate_id] : null;
          });

          childClientAffiliateList.forEach((item) => {
            if (item.parent) {
              item.referrer_client_affiliate_id = item.parent.id;
              item.root_client_affiliate_id = item.parent.root_client_affiliate_id || item.parent.id;
              item.parent_path = `${item.parent.parent_path}.${item.parent.id}`;
              item.level = item.parent.level + 1;

              updateClientAffiliateList.push(item);
            }
          });
        }

        await forEach(updateClientAffiliateList, async (instance) => {
          await clientAffiliateService.update(instance, { transaction });
        });

        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        logger.error(err);
        throw err;
      }

      return res.ok({ isSuccess: true });
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },

  updateMembershipType: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      logger.info('client::updateMembershipType');
      const { body, affiliateTypeId, organizationId } = req;
      const { ext_client_id, membership_type_id } = body;
      const extClientId = _.trim(ext_client_id).toLowerCase();
      const clientService = Container.get(ClientService);

      const [numOfItems, items] = await clientService.updateWhere(
        {
          ext_client_id,
          organization_id: organizationId,
        },
        {
          membership_type_id: membership_type_id ? membership_type_id : null,
        });

      if (!numOfItems) {
        const errorMessage = res.__('NOT_FOUND_EXT_CLIENT_ID', extClientId);
        return res.badRequest(errorMessage, 'NOT_FOUND_EXT_CLIENT_ID', { fields: ['ext_client_id'] });
      }

      return res.ok({ isSuccess: true });
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },

  getAffiliateCodes: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      logger.info('client::getAffiliateCodes');
      const { body, affiliateTypeId, organizationId, query } = req;
      const extClientId = _.trim(query.ext_client_id).toLowerCase();
      const clientAffiliateService = Container.get(ClientAffiliateService);
      const clientAffiliate = await clientAffiliateService.findByExtClientIdAndAffiliateTypeId(extClientId, affiliateTypeId);

      if (!clientAffiliate) {
        const errorMessage = res.__('NOT_FOUND_EXT_CLIENT_ID', extClientId);
        return res.badRequest(errorMessage, 'NOT_FOUND_EXT_CLIENT_ID', { fields: ['ext_client_id'] });
      }

      const affiliateCodeService = Container.get(AffiliateCodeService);
      const cond = {
        client_affiliate_id: clientAffiliate.id,
        deleted_flg: false,
      };
      const affiliateCodes = await affiliateCodeService.findAll(cond);
      const result = affiliateCodes.map(x => x.code);

      return res.ok(result);
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },

  getInvitees: async (req, res, next) => {
    const logger = Container.get('logger');

    try {
      logger.info('client::getInvitees');
      const { body, affiliateTypeId, organizationId, query } = req;
      const { offset, limit } = query;
      const extClientId = _.trim(query.ext_client_id).toLowerCase();

      // const clientService = Container.get(ClientService);
      const clientAffiliateService = Container.get(ClientAffiliateService);
      const clientAffiliate = await clientAffiliateService.findByExtClientIdAndAffiliateTypeId(extClientId, affiliateTypeId);

      if (!clientAffiliate) {
        const errorMessage = res.__('NOT_FOUND_EXT_CLIENT_ID', extClientId);
        return res.badRequest(errorMessage, 'NOT_FOUND_EXT_CLIENT_ID', { fields: ['ext_client_id'] });
      }

      const condition = {
        referrer_client_affiliate_id: clientAffiliate.id,
      };
      const off = parseInt(offset);
      const lim = parseInt(limit);
      const order = [['created_at', 'DESC']];
      const { count: total, rows: items } = await clientAffiliateService.findAndCountAll({ condition, offset: off, limit: lim, order });

      let result = [];
      if (items.length > 0) {
        // Get email list
        const clientService = Container.get(ClientService);
        const clientIdList = items.map(x => x.client_id);
        const clients = await clientService.findByIdList(clientIdList);

        result = items.map(item => {
          const client = clients.find(x => x.id === item.id);

          return {
            ...item.get({ plain: true }),
            extClientId: client ? client.ext_client_id : null,
          };
        });
      }

      return res.ok({
        items: inviteeMapper(result),
        offset: off,
        limit: lim,
        total: total
      });
    }
    catch (err) {
      logger.error(err);

      next(err);
    }
  },

  getTreeChart: async (req, res, next) => {
    const logger = Container.get('logger');
    try {
      logger.info('Get tree chart');
      const { body, affiliateTypeId, organizationId, query } = req;
      const { offset, limit } = query;
      const extClientId = _.trim(query.ext_client_id).toLowerCase();
      const clientAffiliateService = Container.get(ClientAffiliateService);
      const clientAffiliate = await clientAffiliateService.findByExtClientIdAndAffiliateTypeId(extClientId, affiliateTypeId);

      if (!clientAffiliate) {
        const errorMessage = res.__('NOT_FOUND_EXT_CLIENT_ID', extClientId);
        return res.badRequest(errorMessage, 'NOT_FOUND_EXT_CLIENT_ID', { fields: ['ext_client_id'] });
      }

      const descendants = await clientAffiliateService.getDescendants(clientAffiliate);
      const clientService = Container.get(ClientService);
      const clientIdList = descendants.map(x => x.client_id);
      const clients = await clientService.findByIdList(clientIdList);

      const mapItems = descendants.map(clientAffiliate => {
        const client = clients.find(client => client.id === clientAffiliate.client_id);

        return {
          ...clientAffiliate.get({ plain: true }),
          extClientId: client ? client.ext_client_id : null,
        };
      });

      const rootClientAffiliate = {
        ...clientAffiliate.get({ plain: true }),
        extClientId: extClientId,
      };
      const rootNode = clientHelper.buildTree(rootClientAffiliate, mapItems);

      return res.ok(rootNode);
    }
    catch (error) {
      logger.error('getTreeChart fail', error);

      next(error);
    }
  },

};

module.exports = controller;
