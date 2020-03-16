const Model = require('app/model').policies;

module.exports = async () => {
  const count = await Model.count();

  if (count === 0) {
    await Model.bulkCreate([
      {
        id: '004a33b7-b75e-4c84-1111-7829b18f6f38',
        name: 'MoonStake Default Membership Policy',
        max_levels: 4,
        rates: [10, 5, 3, 2],
      },
      {
        id: '004a33b7-b75e-4c84-2222-7829b18f6f38',
        name: 'MoonStake Default Affiliate Policy',
        max_levels: null,
        rates: [10, 8, 6, 4, 2],
      },

    ], {
      returning: true
    });
  }
};
