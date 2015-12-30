'use strict';

const util = require('util');

function RecordNotFoundError(type, criteria, message) {
  if (!(this instanceof RecordNotFoundError)) {
    return new RecordNotFoundError(type, criteria);
  }
  this.statusCode = 404;
  this.name = 'RecordNotFound';
  this.message = message || 'A record of type ' + type + ' was not found';
  if (criteria) {
    this.criteria = util.isString(criteria) ? criteria : JSON.stringify(criteria);
  }
}

util.inherits(RecordNotFoundError, Error);

module.exports = RecordNotFoundError;
