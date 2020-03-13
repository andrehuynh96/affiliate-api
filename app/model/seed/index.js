const config = require("app/config");

if (config.enableSeed) {
  try {
    require("./cosmos-config");
    require("./iris-config");
    require("./partner");
    require("./partner-api-key");
    require("./partner-tx-meno");
    require("./staking-platform");
  }
  catch (err) {
    console.log(err)
  }
}