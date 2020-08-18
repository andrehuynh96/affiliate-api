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

const Op = Sequelize.Op;
const MEMBERSHIP_AFFILIATE_TYPE_ID = 1;
const AFFILIATE_AFFILIATE_TYPE_ID = 2;

module.exports = async () => {
  console.log('Update membership tree chart. START');
  const clientService = Container.get(ClientService);
  const clientAffiliateService = Container.get(ClientAffiliateService);
  const affiliateCodeService = Container.get(AffiliateCodeService);
  const clientAffiliates = await ClientAffiliate.findAll({
    where: {
      affiliate_type_id: MEMBERSHIP_AFFILIATE_TYPE_ID,
      referrer_client_affiliate_id: null,
    }
  });

  await forEach(clientAffiliates, async membershipClientAffiliate => {
    const affiliateClientAffiliate = await ClientAffiliate.findOne({
      where: {
        affiliate_type_id: AFFILIATE_AFFILIATE_TYPE_ID,
        client_id: membershipClientAffiliate.client_id,
      }
    });

    if (!affiliateClientAffiliate || !affiliateClientAffiliate.referrer_client_affiliate_id) {
      return;
    }

    const client = await clientService.findByPk(membershipClientAffiliate.client_id);

    console.log(`Client ${client.ext_client_id} is on wrong tree chart.`, affiliateClientAffiliate.referrer_client_affiliate_id);
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

    const data = {
      referrer_client_affiliate_id: referrerClientAffiliate.id,
      root_client_affiliate_id: referrerClientAffiliate.root_client_affiliate_id || referrerClientAffiliate.id,
      parent_path: `${referrerClientAffiliate.parent_path}.${referrerClientAffiliate.id}`,
      level: referrerClientAffiliate.level + 1,
    };
    // console.log(data);
    await clientAffiliateService.updateWhere({ id: membershipClientAffiliate.id }, data);
  });


  console.log('Update membership tree chart. END');
};
