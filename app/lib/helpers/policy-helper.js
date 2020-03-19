const typedi = require('typedi');
const {
  AffiliateCodeService,
  AffiliateTypeService,
  ClientService,
  PolicyService,
} = require('../../services');
const Container = typedi.Container;

const policyHelper = {

  // Get policy witch apply for clients that same root client
  async getPolicy({ affiliateTypeId, clientService, client }) {
    // First, we find policy witch apply for root user
    const rootClientId = client.root_client_id;
    let policy = null;
    let rootClient = null;

    // Below level 1
    if (rootClientId) {
      rootClient = await clientService.findById(rootClientId);
      policy = (rootClient && rootClient.policy) ? rootClient.policy : null;
    }

    if (!policy) {
      const affiliateTypeService = Container.get(AffiliateTypeService);
      const affiliateType = await affiliateTypeService.findByPk(affiliateTypeId);
      policy = affiliateType.policy;
    }

    return {
      policy,
      rootClient
    };
  }

};

module.exports = policyHelper;
