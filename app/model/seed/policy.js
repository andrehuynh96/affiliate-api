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
      membership_rate: {
        // Silver
        'd146bc01-9e56-4664-9788-79e518877f0b': 20,
        // Gold
        '88fda933-0658-49c4-a9c7-4c0021e9a071': 100,
      },
      is_membership_system: false,
    }));

    // models.push(new MembershipAffiliatePolicy({
    //   name: 'AffiliateSystem - Membership Affiliate Policy',
    //   proportion_share: 0,
    //   max_levels: 4,
    //   rates: [50, 30, 15, 5],
    //   organization_id: '69366383-b9c2-497c-1111-391b017772ba',
    //   is_membership_system: false,
    //   membership_rate: {
    //     // Silver
    //     'd146bc01-9e56-4664-9788-79e518877f0b': 20,
    //     // Gold
    //     '88fda933-0658-49c4-a9c7-4c0021e9a071': 100,
    //   },
    // }));

    models.push(new AffiliatePolicy({
      name: 'AffiliateSystem - Affiliate Policy',
      max_levels: null,
      proportion_share: 20,
      rates: [50, 25, 15, 10],
      organization_id: '69366383-b9c2-497c-1111-391b017772ba',
      is_membership_system: false,
    }));

    models.push(new AffiliatePolicy({
      name: 'MembershipSystem - Affiliate Policy',
      max_levels: 2,
      rates: [75, 25],
      proportion_share: 20,
      organization_id: '69366383-b9c2-497c-1111-391b017772ba',
      is_membership_system: true,
    }));

    await Model.bulkCreate(models, {
      returning: true
    });

  }
};
