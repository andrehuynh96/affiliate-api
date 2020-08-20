const Sequelize = require('sequelize');
const moment = require('moment');
const _ = require('lodash');
const { Container, Service } = require('typedi');
const { map, forEach, forEachSeries } = require('p-iteration');
const db = require('app/model');
const ClientAffiliate = require('app/model').client_affiliates;
const Client = require('app/model').clients;
const {
  AffiliateCodeService,
  AffiliateTypeService,
  ClientService,
  ClientAffiliateService,
} = require('app/services');
const config = require('app/config');

const Op = Sequelize.Op;
const sequelize = db.sequelize;
const MEMBERSHIP_AFFILIATE_TYPE_ID = 1;
const AFFILIATE_AFFILIATE_TYPE_ID = 2;

module.exports = async () => {
  if (!config.patchData.isEnabledUpdateMembershipTreeChart) {
    return;
  }

  console.log('Update membership tree chart. START');
  const clientService = Container.get(ClientService);
  const clientAffiliateService = Container.get(ClientAffiliateService);
  const affiliateCodeService = Container.get(AffiliateCodeService);
  const logger = Container.get('logger');

  const affiliateClientAffiliates = await ClientAffiliate.findAll({
    where: {
      affiliate_type_id: AFFILIATE_AFFILIATE_TYPE_ID,
    },
    order: [['level', 'ASC'], ['created_at', 'ASC']]
  });

  await forEachSeries(affiliateClientAffiliates, async affiliateClientAffiliate => {
    const clientId = affiliateClientAffiliate.client_id;
    const client = await clientService.findByPk(affiliateClientAffiliate.client_id);

    // logger.info(`Processing ${client.ext_client_id} `, affiliateClientAffiliate.id, affiliateClientAffiliate.level);
    const membershipClientAffiliate = await clientAffiliateService.findOne({
      client_id: clientId,
      affiliate_type_id: MEMBERSHIP_AFFILIATE_TYPE_ID,
    });

    if (!client.membership_type_id && membershipClientAffiliate) {
      logger.info(`${client.ext_client_id} is not a membership but has data on membership network!`);
    }

    if (!client.membership_type_id) {
      return;
    }

    // Member doesn't have refferer
    if (!affiliateClientAffiliate.referrer_client_affiliate_id) {
      if (!membershipClientAffiliate) {
        logger.warn(`Missing membership data for ${client.ext_client_id}.`);
        const code = await affiliateCodeService.generateCode();
        const data = {
          client_id: clientId,
          affiliate_type_id: MEMBERSHIP_AFFILIATE_TYPE_ID,
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

        await clientAffiliateService.create(data);
        return;
      }

      membershipClientAffiliate.referrer_client_affiliate_id = null;
      membershipClientAffiliate.level = 1;
      membershipClientAffiliate.parent_path = 'root';
      membershipClientAffiliate.root_client_affiliate_id = null;
      const hasChanged = hasChangedData(membershipClientAffiliate);
      if (hasChanged) {
        logger.info(`Sync membership data for ${client.ext_client_id}. ClientAffiliateId: ${membershipClientAffiliate.id}`);
        await clientAffiliateService.update(membershipClientAffiliate);
      }

      return;
    }

    let referrerClientAffiliate = await clientAffiliateService.findByPk(affiliateClientAffiliate.referrer_client_affiliate_id);
    referrerClientAffiliate = !referrerClientAffiliate ? null : await clientAffiliateService.findOne({
      client_id: referrerClientAffiliate.client_id,
      affiliate_type_id: MEMBERSHIP_AFFILIATE_TYPE_ID,
    });

    if (!referrerClientAffiliate) {
      logger.warn(`Can not find reffer for ${client.ext_client_id}, AffiliateClientAffiliateId: ${affiliateClientAffiliate.referrer_client_affiliate_id}.`);
      return;
    }

    if (!membershipClientAffiliate) {
      logger.warn(`Missing membership data for ${client.ext_client_id}.`);
      const code = await affiliateCodeService.generateCode();
      const data = {
        client_id: clientId,
        affiliate_type_id: MEMBERSHIP_AFFILIATE_TYPE_ID,
        referrer_client_affiliate_id: referrerClientAffiliate.id,
        root_client_affiliate_id: referrerClientAffiliate.root_client_affiliate_id || referrerClientAffiliate.id,
        parent_path: `${referrerClientAffiliate.parent_path}.${referrerClientAffiliate.id}`,
        level: referrerClientAffiliate.level + 1,
        actived_flg: true,
        affiliateCodes: [{
          code,
          deleted_flg: false,
        }]
      };

      await clientAffiliateService.create(data);
      return;
    }

    await updateClientAffiliate(membershipClientAffiliate, referrerClientAffiliate, logger, client, clientAffiliateService);
  });

  console.log('Update membership tree chart. END');
};

async function updateClientAffiliate(membershipClientAffiliate, referrerClientAffiliate, logger, client, clientAffiliateService) {
  const updateProperties = [
    'referrer_client_affiliate_id',
    'root_client_affiliate_id',
    'parent_path',
    'level',
  ];
  const beforeData = _.pick(membershipClientAffiliate, updateProperties);
  membershipClientAffiliate.referrer_client_affiliate_id = referrerClientAffiliate.id;
  membershipClientAffiliate.root_client_affiliate_id = referrerClientAffiliate.root_client_affiliate_id || referrerClientAffiliate.id;
  membershipClientAffiliate.parent_path = `${referrerClientAffiliate.parent_path}.${referrerClientAffiliate.id}`;
  membershipClientAffiliate.level = referrerClientAffiliate.level + 1;
  const afterData = _.pick(membershipClientAffiliate, updateProperties);
  let hasChanged = hasChangedData(membershipClientAffiliate);

  if (hasChanged) {
    logger.info(`Sync membership data for ${client.ext_client_id}. ClientAffiliateId: ${membershipClientAffiliate.id}`);
    logger.info(`Before: ${JSON.stringify(beforeData)}`);
    logger.info(`After: ${JSON.stringify(afterData)}`);
    await clientAffiliateService.update(membershipClientAffiliate);
  }
}

function hasChangedData(membershipClientAffiliate) {
  let hasChanged = membershipClientAffiliate.changed();
  if (_.isArray(hasChanged) && hasChanged.length > 0) {
    hasChanged = true;
  }

  return hasChanged;
}

