const typedi = require('typedi');
const _ = require('lodash');
const {
  AffiliateCodeService,
  AffiliateTypeService,
  ClientAffiliateService,
  PolicyService,
} = require('../../services');
const Container = typedi.Container;

const policyHelper = {
  // Get policy witch apply for clients that same root client
  async getPolicies({ affiliateTypeId, clientAffiliateService, clientAffiliate }) {
    // First, we find policy witch apply for root user
    const rootClientAffiliateId = clientAffiliate.root_client_affiliate_id || clientAffiliate.id;
    let policies = null;
    let rootClientAffiliate = null;

    // Below level 1
    if (rootClientAffiliateId) {
      rootClientAffiliate = await clientAffiliateService.findByPk(rootClientAffiliateId, { isIncludePolicies: true });
      policies = rootClientAffiliate.ClientPolicies;
    }

    if (!_.some(policies)) {
      const affiliateTypeService = Container.get(AffiliateTypeService);
      const affiliateType = await affiliateTypeService.findByPk(affiliateTypeId, { isIncludePolicies: true });
      policies = await affiliateType.DefaultPolicies;
    }

    return {
      policies,
      rootClient: rootClientAffiliate
    };
  },

  async getPolicyForRootClient({ affiliateTypeId, userPolicyId, policyService }) {
    let policy = null;
    if (userPolicyId) {
      policy = await policyService.findByPk(userPolicyId);

      return policy;
    }

    const affiliateTypeService = Container.get(AffiliateTypeService);
    const affiliateType = await affiliateTypeService.findByPk(affiliateTypeId);
    const policies = affiliateType.polices;

    console.info(policies);

    // return policy.get({ plain: true });
    return policy;
  }

};

module.exports = policyHelper;
