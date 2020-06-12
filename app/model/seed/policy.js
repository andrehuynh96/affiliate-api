const Model = require('app/model').policies;
const MembershipType = require('app/model').membership_types;
const PolicyType = require('app/model/value-object/policy-type');
const {
  MembershipPolicy,
  MembershipAffiliatePolicy,
  AffiliatePolicy
} = require('app/classes/policies');

module.exports = async () => {
  const count = await Model.count();

  if (!count) {
    const models = [];

    models.push(new MembershipPolicy({
      name: 'AffiliateSystem - Membership Policy',
      proportion_share: 10,
      max_levels: 4,
      membership_rate: {
        'SILVER': 20,
        'GOLD': 50,
        'PLATINUM': 70,
        'DIAMOND': 100,
      }
    }));

    models.push(new MembershipAffiliatePolicy({
      name: 'AffiliateSystem - Membership Affiliate Policy',
      proportion_share: 20,
      max_levels: 4,
      rates: [50, 30, 15, 5],
      organization_id: '69366383-b9c2-497c-1111-391b017772ba',
    }));

    models.push(new AffiliatePolicy({
      name: 'AffiliateSystem - Affiliate Policy',
      max_levels: null,
      proportion_share: 20,
      rates: [50, 30, 15, 5],
      organization_id: '69366383-b9c2-497c-1111-391b017772ba',
    }));

    models.push(new AffiliatePolicy({
      name: 'MembershipSystem - Affiliate Policy',
      max_levels: 5,
      rates: [50, 30, 15, 5],
      proportion_share: 30,
      organization_id: '69366383-b9c2-497c-1111-391b017772ba',
    }));

    await Model.bulkCreate(models, {
      returning: true
    });

  }
};
