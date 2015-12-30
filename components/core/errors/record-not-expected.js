'use strict';

const util = require('util');

function RecordNotExpectedError(type, criteria, message) {
  if (!(this instanceof RecordNotExpectedError)) {
    return new RecordNotExpectedError(type, criteria);
  }
  this.statusCode = 400;
  this.name = 'RecordNotExpected';
  this.message = message || 'A record of type ' + type + ' was not expected to exist';
  if (criteria) {
    this.criteria = util.isString(criteria) ? criteria : JSON.stringify(criteria);
  }
}

util.inherits(RecordNotExpectedError, Error);

module.exports = RecordNotExpectedError;
