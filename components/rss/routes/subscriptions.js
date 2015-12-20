'use strict';

const handlers = require('../handlers/subscriptions');

module.exports = [{
  method: 'GET',
  path: '/feed-subscriptions',
  handler: handlers.getFeedSubscriptions
}, {
  method: 'POST',
  path: '/feed-subscriptions',
  handler: handlers.createSubscription
}, {
  method: ['PUT', 'PATCH'],
  path: '/feed-subscriptions/{id}',
  handler: handlers.updateSubscription
}, {
  method: 'DELETE',
  path: '/feed-subscriptions/{id}',
  handler: handlers.removeSubscription
}, {
  method: 'GET',
  path: '/users/{userId}/feed-subscriptions',
  handler: handlers.getFeedSubscriptions
}, {
  method: 'POST',
  path: '/users/{userId}/feed-subscriptions',
  handler: handlers.createSubscription
}, {
  method: 'GET',
  path: '/users/{userId}/feed-subscriptions/{feedId}',
  handler: handlers.getFeedSubscription
}, {
  method: 'POST',
  path: '/index/posts',
  handler: handlers.indexPosts
}];
