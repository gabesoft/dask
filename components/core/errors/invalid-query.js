'use strict';

var util = require('util');

util.inherits(InvalidQueryError, Error);

function InvalidQueryError (msg, query) {
    if (!(this instanceof InvalidQueryError)) {
        return new InvalidQueryError();
    }
    this.statusCode = 400;
    this.name = 'InvalidQueryError';
    this.message = msg;
    this.query = query;
}

module.exports = InvalidQueryError;
