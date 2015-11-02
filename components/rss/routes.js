'use strict';

const handler = require('./handlers');

module.exports = [{
  method: 'POST',
  path: '/feeds',
  handler: handler.createFeed
}, {
  method: ['PUT', 'PATCH'],
  path: '/feeds/{id}',
  handler: handler.updateFeed
}, {
  method: 'DELETE',
  path: '/feeds/{id}',
  handler: handler.removeFeed
}, {
  method: 'GET',
  path: '/feeds/{id}',
  handler: handler.readFeed
}, {
  method: 'GET',
  path: '/feeds',
  handler: handler.searchFeeds
}, {
  method: 'POST',
  path: '/posts',
  handler: handler.createPost
}, {
  method: ['PUT', 'PATCH'],
  path: '/posts/{id}',
  handler: handler.updatePost
}, {
  method: 'DELETE',
  path: '/posts/{id}',
  handler: handler.removePost
}, {
  method: 'GET',
  path: '/posts/{id}',
  handler: handler.readPost
}, {
  method: 'GET',
  path: '/posts',
  handler: handler.searchPosts
} ];
