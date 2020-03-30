const Model = require('app/model').apps;

module.exports = async () => {
  const count = await Model.count();

  if (count === 0) {
    await Model.bulkCreate([
      {
        id: '87dc99bd-347b-46fa-87f1-08f3bb484444',
        organization_id: '69366383-b9c2-497c-1111-391b017772ba',
        name: 'MoonStake',
        api_key: 'DEV-487e21ca-9c95-46c0-9c24-bd86a8b38e4b',
        secret_key: 'dee2cdcc-49be-4455-9ca0-56393aee14d6',
        actived_flg: true,
        deleted_flg: false,
      },
    ], {
      returning: true
    });
  }
};
