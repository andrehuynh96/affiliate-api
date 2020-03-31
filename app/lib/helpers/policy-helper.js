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
      policies = await rootClientAffiliate.ClientPolicies;
      policies = policies ? policies.filter(x => !x.deleted_flg) : [];
    }

    if (!_.some(policies)) {
      const affiliateTypeService = Container.get(AffiliateTypeService);
      const affiliateType = await affiliateTypeService.findByPk(affiliateTypeId);
      policies = await affiliateType.getDefaultPolicies();
      policies = policies ? policies.filter(x => !x.deleted_flg) : [];
    }

    return {
      policies,
      rootClient: rootClientAffiliate
    };
  },

  async validatePolicyIdList(policyIdList, policyService) {
    const policyList = await policyService.findByIdList(policyIdList);
    const notFoundPolicyIdList = [];

    policyIdList.forEach(id => {
      if (!policyList.find(x => x.id === id)) {
        notFoundPolicyIdList.push(id);
      }
    });

    return { notFoundPolicyIdList, policyList };
  }


};

module.exports = policyHelper;
