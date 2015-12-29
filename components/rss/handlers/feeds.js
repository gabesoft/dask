'use strict';

const FeedModel = require('../feed-model'),
      responder = require('../../core/responder'),
      Helper = require('../../core/handlers-helper').Helper,
      helper = new Helper(FeedModel);

function searchViaGet(request) {
  return helper.searchViaGet(request);
}

function searchViaPost(request) {
  return helper.searchViaPost(request);
}

function bulkRemoveFeeds(request) {
  return helper.bulkRemove(request.payload);
}

function bulkUpdateFeeds(request) {
  return helper.bulkUpdate(request.payload);
}

function bulkReplaceFeeds(request) {
  return helper.bulkReplace(request.payload);
}

function bulkCreateFeeds(request) {
  return helper.bulkCreate(request.payload);
}

function removeFeed(request) {
  return helper.remove(request.params.id);
}

function updateFeed(request) {
  return helper.update(request.payload, request.params.id);
}

function replaceFeed(request) {
  return helper.replace(request.payload, request.params.id);
}

function createFeed(request) {
  return helper.create(request.payload);
}

function readFeed(request) {
  return helper.read(request.params.id);
}

const methods = {
  bulkRemoveFeeds: { method: bulkRemoveFeeds, response: 'bulkRemoved' },
  bulkUpdateFeeds: { method: bulkUpdateFeeds, response: 'bulkUpdated' },
  bulkReplaceFeeds: { method: bulkReplaceFeeds, response: 'bulkReplaced' },
  bulkCreateFeeds: { method: bulkCreateFeeds, response: 'bulkCreated' },
  removeFeed: { method: removeFeed, response: 'removed' },
  updateFeed: { method: updateFeed, response: 'updated' },
  replaceFeed: { method: replaceFeed, response: 'replaced' },
  createFeed: { method: createFeed, response: 'created' },
  readFeed: { method: readFeed, response: 'read' },
  searchViaPost: { method: searchViaPost, response: 'search' },
  searchViaGet: { method: searchViaGet, response: 'search' }
};

Object.keys(methods).forEach(name => {
  const data = methods[name];
  module.exports[name] = responder.decorate(data.method, data.response);
});
