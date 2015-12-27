const Joi = require('joi');

Joi.objectId = function objectId() {
  return Joi.string().regex(/^[0-9a-fA-F]{24}$/);
};

Joi.userPostId = function objectId() {
  return Joi.string().regex(/^[0-9a-fA-F]{24}-[0-9a-fA-F]{24}$/);
};

module.exports = Joi;
