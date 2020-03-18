const typedi = require('typedi');
const {
  AffiliateCodeService,
  AffiliateTypeService,
  ClientService,
  PolicyService,
} = require('../../services');

const Container = typedi.Container;

const controller = {
  create: async (req, res, next) => {
    try {
      const { body, affiliateTypeId } = req;
      const { user_id, affiliate_code } = body;
      const affiliateCodeService = Container.get(AffiliateCodeService);
      const clientService = Container.get(ClientService);
      const code = affiliateCodeService.generateCode();

      let level = 1;
      let parentPath = 'root';
      let rootClientId = null;
      let affiliateCodeInstance = null;

      // Has refferer
      if (affiliate_code) {
        affiliateCodeInstance = await affiliateCodeService.findByPk(affiliate_code);

        if (!affiliateCodeInstance) {
          return res.badRequest(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE', { fields: ['affiliate_code'] });
        }

        const referrer_user_id = affiliateCodeInstance.client_id;
        const referrerClient = await clientService.findByPk(referrer_user_id);

        if (!referrerClient) {
          return res.notFound(res.__('NOT_FOUND_REFERRER_USER'), 'NOT_FOUND_REFERRER_USER');
        }

        if (referrerClient.affiliate_type_id !== affiliateTypeId) {
          return res.badRequest(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE', { fields: ['affiliate_code'] });
        }

        rootClientId = referrerClient.id;
        // Check max level that policy can set for users
        const policy = await controller.getPolicyByAffiliateTypeId(affiliateTypeId, rootClientId);
        if (!policy) {
          return res.notFound(res.__('NOT_FOUND_POLICY'), 'NOT_FOUND_POLICY');
        }

        level = referrerClient.level + 1;
        const maxLevels = policy.max_levels;
        if (maxLevels && level > maxLevels) {
          const errorMessage = res.__('POLICY_LEVEL_IS_EXCEED', maxLevels);

          return res.forbidden(errorMessage, 'POLICY_LEVEL_IS_EXCEED', { fields: ['affiliate_code'] });
        }

        parentPath = referrerClient.parentPath ? `${referrerClient.parentPath}.${referrerClient.id}` : referrerClient.id.toString();
      }

      const data = {
        user_id,
        affiliate_type_id: affiliateTypeId,
        level,
        parent_path: parentPath,
        root_client_id: rootClientId,
        actived_flg: true,
        affiliateCodes: [{
          code,
        },
        ]
      };
      const client = await clientService.create(data);

      return res.ok(client);
    }
    catch (err) {
      next(err);
    }
  },

  async getPolicyByAffiliateTypeId(affiliateTypeId, rootClientId) {
    // First, we find policy witch apply for root user
    const policyService = Container.get(PolicyService);
    let policy = await policyService.findByClientId(rootClientId);

    if (!policy) {
      const affiliateTypeService = Container.get(AffiliateTypeService);
      const affiliateType = await affiliateTypeService.findByPk(affiliateTypeId);
      policy = affiliateType.policy;
    }

    return policy;
  }

};

module.exports = controller;
