/* eslint-disable prefer-const */
const typedi = require('typedi');
const AffiliateCodeService = require('../../services/affiliate-code-service');
const ClientService = require('../../services/client-service');

const Container = typedi.Container;

module.exports = {
  create: async (req, res, next) => {
    try {
      const { body, affiliateTypeId } = req;
      const { user_id, affiliate_code } = body;
      const affiliateCodeService = Container.get(AffiliateCodeService);
      const clientService = Container.get(ClientService);
      const code = affiliateCodeService.generateCode();

      let level = 1;
      let parentPath = '';
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

        rootClientId = referrerClient.id;
        level = referrerClient.level + 1;
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

};
