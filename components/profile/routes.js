'use strict';

var handler = require('./handlers');

module.exports = [ {
    method  : [ 'PUT', 'POST' ]
  , path    : '/users/{id}/profile'
  , handler : handler.save
}, {
    method  : 'GET'
  , path    : '/users/{id}/profile'
  , handler : handler.readByUser
}, {
    method : 'GET'
  , path : '/profiles/{id}'
  , handler : handler.read
}, {
    method  : 'GET'
  , path    : '/profiles'
  , handler : handler.search
} ];
