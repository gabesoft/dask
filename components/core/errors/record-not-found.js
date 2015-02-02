'use strict';

var util = require('util');

util.inherits(RecordNotFoundError, Error);

function RecordNotFoundError (type, criteria) {
    if (!(this instanceof RecordNotFoundError)) {
        return new RecordNotFoundError(type, criteria);
    }
    this.statusCode = 404;
    this.name = 'RecordNotFound';
    this.message = 'A record of type ' + type + ' was not found';
    this.criteria = JSON.stringify(criteria);
}

module.exports = RecordNotFoundError;
