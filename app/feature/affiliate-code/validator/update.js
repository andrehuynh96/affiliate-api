const Joi = require('joi');

const schema = Joi.object().keys({
    name: Joi.string().required(),
    updated_by: Joi.number().integer().required()
});

module.exports = schema;