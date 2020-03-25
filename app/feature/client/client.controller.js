const typedi = require('typedi');
const {
  AffiliateCodeService,
  AffiliateTypeService,
  ClientService,
  PolicyService,
} = require('../../services');
const { policyHelper } = require('../../lib/helpers');

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
      let referrer_client_id = null;
      let rootClientId = null;
      let affiliateCodeInstance = null;

      // Has refferer
      if (affiliate_code) {
        affiliateCodeInstance = await affiliateCodeService.findByPk(affiliate_code);

        if (!affiliateCodeInstance) {
          return res.badRequest(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE', { fields: ['affiliate_code'] });
        }

        referrer_client_id = affiliateCodeInstance.client_id;
        const referrerClient = await clientService.findByPk(referrer_client_id);

        if (!referrerClient) {
          return res.notFound(res.__('NOT_FOUND_REFERRER_USER'), 'NOT_FOUND_REFERRER_USER');
        }

        if (referrerClient.affiliate_type_id !== affiliateTypeId) {
          return res.badRequest(res.__('NOT_FOUND_AFFILIATE_CODE'), 'NOT_FOUND_AFFILIATE_CODE', { fields: ['affiliate_code'] });
        }

        rootClientId = referrerClient.root_client_id || referrerClient.id;
        // Check max level that policy can set for users
        const { policy } = await policyHelper.getPolicy({ affiliateTypeId, clientService, client: referrerClient });
        if (!policy) {
          return res.notFound(res.__('NOT_FOUND_POLICY'), 'NOT_FOUND_POLICY');
        }

        level = referrerClient.level + 1;
        const maxLevels = policy.max_levels;
        if (maxLevels && level > maxLevels) {
          const errorMessage = res.__('POLICY_LEVEL_IS_EXCEED', maxLevels);

          return res.forbidden(errorMessage, 'POLICY_LEVEL_IS_EXCEED', { fields: ['affiliate_code'] });
        }

        parentPath = `${referrerClient.parent_path}.${referrerClient.id}`;
      }

      const data = {
        user_id,
        affiliate_type_id: affiliateTypeId,
        referrer_client_id: referrer_client_id,
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

      return res.ok(client.affiliateCodes[0]);
    }
    catch (err) {
      next(err);
    }
  },

};

module.exports = controller;
