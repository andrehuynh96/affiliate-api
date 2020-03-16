const Model = require('app/model').apps;

(async () => {
  const count = await Model.count();

  if (count === 0) {
    await Model.bulkCreate([
      {
        id: '87dc99bd-347b-46fa-87f1-08f3bb484444',
        organization_id: '69366383-b9c2-497c-1111-391b017772ba',
        affiliate_type_id: 100,
        name: 'MoonStake Membership',
        api_key: '487e21ca-9c95-46c0-9c24-bd86a8b38e4b',
        secret_key: 'dee2cdcc-49be-4455-9ca0-56393aee14d6',
        actived_flg: true,
      },
      {
        id: 'a1e6c30d-b781-4461-ba47-230f6c8c5555',
        organization_id: '69366383-b9c2-497c-1111-391b017772ba',
        affiliate_type_id: 101,
        name: 'MoonStake Affiliate',
        api_key: '272a72a3-df6a-469a-b39d-b8f86c7ae206',
        secret_key: '0d42d5a3-7d4c-4324-8849-ab90c3ed8f42',
        actived_flg: true,
      }
    ], {
      returning: true
    });
  }
})();
