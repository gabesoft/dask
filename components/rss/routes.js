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
}, {
  method: 'POST',
  path: '/posts',
  handler: handlers.createPost
}, {
  method: ['PUT', 'PATCH'],
  path: '/posts/{id}',
  handler: handlers.updatePost
}, {
  method: 'DELETE',
  path: '/posts/{id}',
  handler: handlers.removePost
}, {
  method: 'GET',
  path: '/posts/{id}',
  handler: handlers.readPost
}, {
  method: 'GET',
  path: '/posts',
  handler: handlers.searchPosts
}, {
  method: 'GET',
  path: '/feed-subscriptions/{userId}',
  handler: handlers.feedSubscriptions
}, {
  method: 'POST',
  path: '/feed-subscriptions',
  handler: handlers.createSubscription
}, {
  method: 'DELETE',
  path: '/feed-subscriptions/{id}',
  handler: handlers.removeSubscription
}];
