'use strict';

const handlers = require('./handlers');

module.exports = [{
  method: 'POST',
  path: '/feeds',
  handler: handlers.createFeed
}, {
  method: ['PUT', 'PATCH'],
  path: '/feeds/{id}',
  handler: handlers.updateFeed
}, {
  method: 'DELETE',
  path: '/feeds/{id}',
  handler: handlers.removeFeed
}, {
  method: 'GET',
  path: '/feeds/{id}',
  handler: handlers.readFeed
}, {
  method: 'GET',
  path: '/feeds',
  handler: handlers.searchFeeds
}];
