'use strict';

var handler = require('./handlers');

module.exports = [{
    method  : 'POST'
  , path    : '/user'
  , handler : handler.create
}, {
    method  : 'PUT'
  , path    : '/user'
  , handler : handler.update
}, {
    method  : 'GET'
  , path    : '/user/{id}'
  , handler : handler.read
}, {
    method  : 'DELETE'
  , path    : '/user/{id}'
  , handler : handler.delete
}];
