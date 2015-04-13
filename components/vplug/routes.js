'use strict';

var handler = require('./handlers');

module.exports = [{
    method  : 'POST'
  , path    : '/vplugs'
  , handler : handler.create
}, {
    method  : 'GET'
  , path    : '/vplugs'
  , handler : handler.search
}, {
    method  : 'DELETE'
  , path    : '/vplugs/{id}'
  , handler : handler.remove
}, {
    method  : [ 'PUT', 'PATCH' ]
  , path    : '/vplugs/{id}'
  , handler : handler.update
}]
