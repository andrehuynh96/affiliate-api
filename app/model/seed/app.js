const Model = require('app/model').apps;

module.exports = async () => {
  const count = await Model.count();

  if (count === 0) {
    await Model.bulkCreate([
      {
        id: '87dc99bd-347b-46fa-87f1-08f3bb484444',
        organization_id: '69366383-b9c2-497c-1111-391b017772ba',
        name: 'MoonStake - Web wallet app',
        api_key: 'bcf71e55-e087-4989-aace-547f1a032491',
        secret_key: 'cd5e42f0a092424aac27a8c61a8c18ce308241d715fc4c8aacc30e49415ccb55',
        actived_flg: true,
        deleted_flg: false,
      },
    ], {
      returning: true
    });
  }
};
