'use strict';

const handler = require('./handlers');

module.exports = [{
  method: 'POST',
  path: '/users',
  handler: handler.create
}, {
  method: 'GET',
  path: '/users',
  handler: handler.search
}, {
  method: ['PUT', 'PATCH'],
  path: '/users/{id}',
  handler: handler.update
}, {
  method: 'GET',
  path: '/users/{id}',
  handler: handler.read
}, {
  method: ['PUT', 'POST', 'PATCH'],
  path: '/users/link',
  handler: handler.link
}, {
  method: 'DELETE',
  path: '/users/{id}',
  handler: handler.remove
}];
