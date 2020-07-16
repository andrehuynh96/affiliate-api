const _ = require('lodash');
const { Container } = require('typedi');
const {
  AffiliateCodeService,
  AffiliateTypeService,
  ClientAffiliateService,
  PolicyService,
} = require('app/services');
const PolicyType = require('app/model/value-object/policy-type');

const policyHelper = {
  // Get policy witch apply for clients that same root client
  async getPolicies({ affiliateTypeId, clientAffiliate, clientAffiliateService, affiliateTypeService }) {
    const rootClientAffiliateId = clientAffiliate.root_client_affiliate_id || clientAffiliate.id;

    return policyHelper.getPolicyForRootClient({
      rootClientAffiliateId,
      affiliateTypeId,
      clientAffiliateService,
      affiliateTypeService,
      currencySymbol: null,
    });
  },

  async getPolicyForRootClient({
    rootClientAffiliateId,
    affiliateTypeId,
    clientAffiliateService,
    affiliateTypeService,
    currencySymbol,
  }) {
    let rootClientAffiliate = null;
    let policies = null;
    // First, we find policy witch apply for root user

    // Below level 1
    if (rootClientAffiliateId) {
      rootClientAffiliate = await clientAffiliateService.findByPk(rootClientAffiliateId, { isIncludePolicies: true });
      policies = rootClientAffiliate ? await rootClientAffiliate.ClientPolicies : null;
      policies = policies ? policies.filter(x => !x.deleted_flg) : [];
    }

    if (!_.some(policies)) {
      const affiliateType = await affiliateTypeService.findByPk(affiliateTypeId);
      policies = await affiliateType.getDefaultPolicies();
      policies = policies ? policies.filter(x => !x.deleted_flg) : [];

      let currencyPolicies = [];
      if (currencySymbol) {
        currencyPolicies = policies.filter(x => x.currency_symbol === currencySymbol);
      }

      if (currencyPolicies.length > 0) {
        policies = currencyPolicies;
      } else {
        policies = policies.filter(x => !x.currency_symbol);
      }

      // console.log(policies.map(x => x.id));
    }

    return {
      policies,
      rootClient: rootClientAffiliate
    };
  },

  async getPoliciesForCurrency({ currencySymbol, affiliateTypeId, affiliateTypeService }) {
    let policies = null;

    const affiliateType = await affiliateTypeService.findByPk(affiliateTypeId);
    policies = await affiliateType.getDefaultPolicies();
    policies = policies ? policies.filter(x => !x.deleted_flg) : [];

    return policies;
  },

  async getMembershipPolicyForCurrency({ currencySymbol, affiliateTypeId, affiliateTypeService }) {
    const policies = await policyHelper.getPoliciesForCurrency({ currencySymbol, affiliateTypeId, affiliateTypeService });

    return policies.find(x => x.type === PolicyType.MEMBERSHIP);
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
