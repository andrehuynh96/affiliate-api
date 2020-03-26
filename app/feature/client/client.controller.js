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
const MembershipType = require('../../model/value-object/membership-type');

const Container = typedi.Container;

const controller = {
  create: async (req, res, next) => {
    try {
      const { body, affiliateTypeId, organizationId } = req;
      const { affiliate_code, membership_type } = body;
      let { ext_client_id } = body;
      ext_client_id = _.trim(ext_client_id).toLowerCase();

      // Validate membership type
      const isValidMembershipType = membership_type ? !!MembershipType[membership_type] : true;
      if (!isValidMembershipType) {
        return res.badRequest(res.__('REGISTER_CLIENT_INVALID_MEMBERSHIP_TYPE'), 'REGISTER_CLIENT_INVALID_MEMBERSHIP_TYPE', { fields: ['membership_type'] });
      }

      const affiliateCodeService = Container.get(AffiliateCodeService);
      const clientAffiliateService = Container.get(ClientAffiliateService);
      const clientService = Container.get(ClientService);
      let level = 1;
      let parentPath = 'root';
      let referrer_client_affiliate_id = null;
      let rootClientAffiliateId = null;
      let affiliateCodeInstance = null;
      let affiliatePolicy = null;

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

        affiliatePolicy = policies.find(x => x.type === PolicyType.AFFILIATE);
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
      // Check duplicate client
      const existClientAffiliate = await clientAffiliateService.findOne({
        client_id: clientId,
        affiliate_type_id: affiliateTypeId,
      });
      if (existClientAffiliate) {
        return res.badRequest(res.__('REGISTER_CLIENT_DUPLICATE_EXT_CLIENT_ID'), 'REGISTER_CLIENT_DUPLICATE_EXT_CLIENT_ID', { fields: ['client_id'] });
      }

      // Update membership
      if (membership_type && client.membership_type !== membership_type) {
        await clientService.updateWhere({
          id: client.id
        }, {
          membership_type
        });
      }

      const code = affiliateCodeService.generateCode();
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