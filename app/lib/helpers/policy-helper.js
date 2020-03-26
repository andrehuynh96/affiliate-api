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
    const rootClientAffiliateId = clientAffiliate.root_client_affiliate_id || clientAffiliate.id;

    return policyHelper.getPolicyForRootClient({ rootClientAffiliateId, affiliateTypeId, clientAffiliateService });
  },

  async getPolicyForRootClient({ rootClientAffiliateId, affiliateTypeId, clientAffiliateService }) {
    let rootClientAffiliate = null;
    let policies = null;
    // First, we find policy witch apply for root user

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
  }

};

module.exports = policyHelper;
