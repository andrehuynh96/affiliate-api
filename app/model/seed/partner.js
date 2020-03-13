const Partner = require("app/model").partners;


(async () => {
  let count = await Partner.count();
  if (count == 0) {
    try {
      let result = await Partner.bulkCreate([{
        id: "ea47be76-1038-11ea-8d71-362b9e155667",
        email: "client@infinito.io",
        name: "Infinito",
        partner_type: "CHILD",
        actived_flg: true,
        deleted_flg: false,
        created_by: 0,
        updated_by: 0
      },
      {
        id: "ed483de6-2d14-11ea-978f-2e728ce88125",
        email: "client@binary.io",
        name: "Binary",
        partner_type: "CHILD",
        actived_flg: true,
        deleted_flg: false,
        created_by: 0,
        updated_by: 0
      },
      {
        id: "13172d8e-2d15-11ea-978f-2e728ce88125",
        email: "salary13@ibl.com",
        name: "Salary13",
        partner_type: "CHILD",
        actived_flg: true,
        deleted_flg: false,
        created_by: 0,
        updated_by: 0
      }], {
          returning: true
        });

      console.log(result);
    }
    catch (err) {
      console.log(err);
    }
  }
})();