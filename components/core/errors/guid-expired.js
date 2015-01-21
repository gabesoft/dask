'use strict';

var util = require('util');

util.inherits(GuidExpiredError, Error);

function GuidExpiredError (guid) {
    if (!(this instanceof GuidExpiredError)) {
        return new GuidExpiredError();
    }
    this.statusCode = 400;
    this.name = 'GuidExpired';
    this.message = 'The guid ' + guid + ' has expired or does not exist';
}

module.exports = GuidExpiredError;
