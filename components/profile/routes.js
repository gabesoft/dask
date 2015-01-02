'use strict';

var handler = require('./handlers');

module.exports = [ {
    method  : [ 'PUT', 'POST' ]
  , path    : '/user/{id}/profile'
  , handler : handler.save
}, {
    method  : 'GET'
  , path    : '/user/{id}/profile'
  , handler : handler.read
} ]
