const Joi = require("@hapi/joi");

//Register Validation
const registerValidation = data => {
  const schema = Joi.object({
    username: Joi.string().allow("-").required(),
    password: Joi.string().min(4).required(),
  });
  return schema.validate(data);
};

//Login Validation
const loginValidation = data => {
  const schema = Joi.object({
    username: Joi.string().allow("-").required(),
    password: Joi.string().min(4).required(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
