const Model = require("app/model").cosmos_cfgs;

(async () => {
  let count = await Model.count();
  if (count == 0) {
    await Model.bulkCreate([{
      id: "075496d2-207a-11ea-978f-2e728ce88125",
      validator: "cosmosvaloper1suvplzztw7kn4ntn9pcduxz2lxfjfy5ane9f6u",
      default: true
    }], {
        returning: true
      });
  }
})();