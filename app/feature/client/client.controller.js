const typedi = require('typedi');
const _ = require('lodash');
const {
  AffiliateCodeService,
  AffiliateTypeService,
  ClientService,
  ClientAffiliateService,
  PolicyService,
} = require('../../services');
const { policyHelper } = require('../../lib/helpers');
const PolicyType = require('../../model/value-object/policy-type');

const Container = typedi.Container;

const controller = {
  create: async (req, res, next) => {
    try {
      const { body, affiliateTypeId, organizationId } = req;
      const { affiliate_code, membership_type } = body;
      let { ext_client_id } = body;
      ext_client_id = _.trim(ext_client_id).toLowerCase();

      const affiliateCodeService = Container.get(AffiliateCodeService);
      const clientAffiliateService = Container.get(ClientAffiliateService);
      const clientService = Container.get(ClientService);

      let level = 1;
      let parentPath = 'root';
      let referrer_client_affiliate_id = null;
      let rootClientAffiliateId = null;
      let affiliateCodeInstance = null;

      // Has refferer
      if (affiliate_code) {
        affiliateCodeInstance = await affiliateCodeService.findByPk(affiliate_code);

        if (!affiliateCodeInstance) {
          return res.badRequest(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE', { fields: ['affiliate_code'] });
        }

        referrer_client_affiliate_id = affiliateCodeInstance.client_affiliate_id;
        const referrerClient = await affiliateCodeInstance.getOwner();

        if (!referrerClient) {
          return res.notFound(res.__('NOT_FOUND_REFERRER_USER'), 'NOT_FOUND_REFERRER_USER');
        }

        if (referrerClient.affiliate_type_id !== affiliateTypeId) {
          return res.badRequest(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE', { fields: ['affiliate_code'] });
        }

        rootClientAffiliateId = referrerClient.root_client_affiliate_id || referrerClient.id;
        // Check max level that policy can set for users
        const { policies } = await policyHelper.getPolicies({ affiliateTypeId, clientAffiliateService, clientAffiliate: referrerClient });
        if (!_.some(policies)) {
          return res.notFound(res.__('NOT_FOUND_POLICY'), 'NOT_FOUND_POLICY');
        }

        const affiliatePolicy = policies.find(x => x.type === PolicyType.AFFILIATE);
        if (!affiliatePolicy) {
          return res.notFound(res.__('NOT_FOUND_POLICY'), 'NOT_FOUND_POLICY');
        }

        level = referrerClient.level + 1;
        const maxLevels = affiliatePolicy.max_levels;
        if (maxLevels && level > maxLevels) {
          const errorMessage = res.__('POLICY_LEVEL_IS_EXCEED', maxLevels);

          return res.forbidden(errorMessage, 'POLICY_LEVEL_IS_EXCEED', { fields: ['affiliate_code'] });
        }

        parentPath = `${referrerClient.parent_path}.${referrerClient.id}`;
      }

      const client = await clientService.findOrCreate({
        ext_client_id,
        organization_id: organizationId,
      }, {
        ext_client_id,
        organization_id: organizationId,
        membership_type,
      });
      const clientId = client.id;

      const code = affiliateCodeService.generateCode();
      const data = {
        client_id: clientId,
        affiliate_type_id: affiliateTypeId,
        referrer_client_id: referrer_client_affiliate_id,
        level,
        parent_path: parentPath,
        root_client_affiliate_id: rootClientAffiliateId,
        actived_flg: true,
        affiliateCodes: [{
          code,
        }]
      };

      const clientAffiliate = await clientAffiliateService.create(data);

      return res.ok(clientAffiliate.affiliateCodes[0]);
    }
    catch (err) {
      next(err);
    }
  },

};

module.exports = controller;
