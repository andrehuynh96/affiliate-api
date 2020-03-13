const Model = require("app/model").partner_api_keys;

(async () => {
  let count = await Model.count();
  if (count == 0) {
    await Model.bulkCreate([{
      id: "656b6f1c-1039-11ea-8d71-362b9e155667",
      partner_id: "ea47be76-1038-11ea-8d71-362b9e155667",
      api_key: "d485c3fd-31b0-496b-8d47-e357d8634075",
      secret_key: "q44EniuCImrmAiTDBtw3rlchK2P1tFLK",
      actived_flg: true,
      created_by: 0
    }], {
        returning: true
      });
  }
})();