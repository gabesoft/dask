'use strict';

const handler = require('./handlers');

module.exports = [{
  method: 'POST',
  path: '/users/{userId}/urls',
  handler: handler.create
}, {
  method: ['PUT', 'PATCH'],
  path: '/users/{userId}/urls/{id}',
  handler: handler.update
}, {
  method: 'DELETE',
  path: '/users/{userId}/urls/{id}',
  handler: handler.remove
}, {
  method: 'GET',
  path: '/users/{userId}/urls/{id}',
  handler: handler.read
}, {
  method: 'GET',
  path: '/users/{userId}/urls',
  handler: handler.search
}, {
  method: 'GET',
  path: '/users/{userId}/queries',
  handler: handler.queries
}];
