'use strict';

const PostModel = require('../post-model'),
      responder = require('../../core/responder'),
      Helper = require('../../core/handlers-helper').Helper,
      helper = new Helper(PostModel);

function searchViaGet(request) {
  return helper.searchViaGet(request);
}

function searchViaPost(request) {
  return helper.searchViaPost(request);
}

function bulkRemovePosts(request) {
  return helper.bulkRemove(request.payload);
}

function bulkUpdatePosts(request) {
  return helper.bulkUpdate(request.payload);
}

function bulkReplacePosts(request) {
  return helper.bulkReplace(request.payload);
}

function bulkCreatePosts(request) {
  return helper.bulkCreate(request.payload);
}

function removePost(request) {
  return helper.remove(request.params.id);
}

function updatePost(request) {
  return helper.update(request.payload, request.params.id);
}

function replacePost(request) {
  return helper.replace(request.payload, request.params.id);
}

function createPost(request) {
  return helper.create(request.payload);
}

function readPost(request) {
  return helper.read(request.params.id);
}

const methods = {
  bulkRemovePosts: { method: bulkRemovePosts, response: 'bulkRemoved' },
  bulkUpdatePosts: { method: bulkUpdatePosts, response: 'bulkUpdated' },
  bulkReplacePosts: { method: bulkReplacePosts, response: 'bulkReplaced' },
  bulkCreatePosts: { method: bulkCreatePosts, response: 'bulkCreated' },
  removePost: { method: removePost, response: 'removed' },
  updatePost: { method: updatePost, response: 'updated' },
  replacePost: { method: replacePost, response: 'replaced' },
  createPost: { method: createPost, response: 'created' },
  readPost: { method: readPost, response: 'read' },
  searchViaPost: { method: searchViaPost, response: 'search' },
  searchViaGet: { method: searchViaGet, response: 'search' }
};

Object.keys(methods).forEach(name => {
  const data = methods[name];
  module.exports[name] = responder.decorate(data.method, data.response);
});
