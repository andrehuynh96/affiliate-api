const Joi = require("joi");
const config = require("app/config");

const schema = Joi.object().keys({
  voter_address: Joi.string().required(),
  tx_id: Joi.string().required(),
  memo: Joi.string().required(),
  type: Joi.string().required().valid(["DELEGATE", "UNDELEGATE"]),
})

module.exports = schema;