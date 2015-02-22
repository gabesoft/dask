'use strict';

var crypto = require('crypto');

function hash () {
    var args = Array.prototype.slice.call(arguments)
      , str  = args.reduce(function (acc, s) { return acc + s; }, '');
    return crypto.createHash('md5').update(str).digest('hex');
}

module.exports.create = hash;
