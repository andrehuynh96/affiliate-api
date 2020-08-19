const Sequelize = require('sequelize');
const moment = require('moment');
const _ = require('lodash');
const { Container, Service } = require('typedi');
const { map, forEach, forEachSeries } = require('p-iteration');
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
const MEMBERSHIP_AFFILIATE_TYPE_ID = 1;
const AFFILIATE_AFFILIATE_TYPE_ID = 2;

module.exports = async () => {
  if (!config.patchData.isEnabledSyncClientForMembershipNetwork) {
    return;
  }

  console.log('Sync membership data');
  const clientService = Container.get(ClientService);
  const clientAffiliateService = Container.get(ClientAffiliateService);
  const affiliateCodeService = Container.get(AffiliateCodeService);

  const clients = await Client.findAll({
    where: {
      membership_type_id: {
        [Op.not]: null,
      }
    },
    order: [['created_at', 'ASC']]
  });

  await forEach(clients, async client => {
    const clientAffiliates = await clientAffiliateService.findAll({
      client_id: client.id,
    });
    const affiliateClientAffiliate = clientAffiliates.find(item => item.affiliate_type_id === AFFILIATE_AFFILIATE_TYPE_ID);
    const membershipClientAffiliate = clientAffiliates.find(item => item.affiliate_type_id === MEMBERSHIP_AFFILIATE_TYPE_ID);

    if (!(affiliateClientAffiliate && !membershipClientAffiliate)) {
      return;
    }

    console.log(`Client ${client.ext_client_id} is missing on membership tree chart.`, affiliateClientAffiliate.referrer_client_affiliate_id);
    const clientId = client.id;

    if (!affiliateClientAffiliate.referrer_client_affiliate_id) {
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

      const clientAffiliate = await clientAffiliateService.create(data);
      return;
    }

    let referrerClientAffiliate = await clientAffiliateService.findByPk(affiliateClientAffiliate.referrer_client_affiliate_id);
    if (!referrerClientAffiliate) {
      return;
    }

    referrerClientAffiliate = await clientAffiliateService.findOne({
      client_id: referrerClientAffiliate.client_id,
      affiliate_type_id: MEMBERSHIP_AFFILIATE_TYPE_ID,
    });

    if (!referrerClientAffiliate) {
      return;
    }

    console.log(`Client ${client.ext_client_id} is reffered by: ${affiliateClientAffiliate.referrer_client_affiliate_id}`);
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

    const clientAffiliate = await clientAffiliateService.create(data);
  });


  console.log('Sync membership data. END');
};
