const Model = require('app/model').organizations;

module.exports = async () => {
  const count = await Model.count();

  if (count === 0) {
    await Model.bulkCreate([{
      id: '69366383-b9c2-497c-1111-391b017772ba',
      name: 'MoonStake',
    }], {
      returning: true
    });
  }
};
