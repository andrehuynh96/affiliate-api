const Model = require("app/model").iris_cfgs;

(async () => {
  let count = await Model.count();
  if (count == 0) {
    await Model.bulkCreate([{
      id: "75442466-0878-440c-9db1-a7006c25a39f",
      validator: "iva1fmwdvfde0ufyryf7xvyk38wq9ujll0pny0p3mt",
      default: true
    }], {
        returning: true
      });
  }
})(); 