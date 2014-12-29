'use strict';

var handler = require('./handlers');

module.exports = [{
    method  : 'POST'
  , path    : '/user'
  , handler : handler.create
}, {
    method  : 'PUT'
  , path    : '/user/{id}'
  , handler : handler.update
}, {
    method  : 'GET'
  , path    : '/user/byemail/{email}'
  , handler : handler.readByEmail
}, {
    method  : 'GET'
  , path    : '/user/{id}'
  , handler : handler.read
}, {
    method  : 'DELETE'
  , path    : '/user/{id}'
  , handler : handler.remove
}];
