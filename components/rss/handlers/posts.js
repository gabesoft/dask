'use strict';

const PostModel = require('../post-model'),
      responder = require('../../core/responder'),
      Helper = require('../../core/handlers-helper'),
      helper = new Helper(PostModel);

function searchViaGet(request, reply) {
  return helper
    .searchViaGet(request)
    .then(responder.searchSuccess(request, reply),
          responder.searchFailure(request, reply));
}

function searchViaPost(request, reply) {
  return helper
    .searchViaPost(request)
    .then(responder.searchSuccess(request, reply),
          responder.searchFailure(request, reply));
}

function remove(id) {
  return PostModel.findById(id).then(doc => doc ? doc.remove() : null);
}

function update(data, id) {
  return PostModel
    .findById(data.id || id)
    .then(doc => doc ? doc.set(data || {}).save() : null);
}

function replace(data, id) {
  const opts = { new: true, upsert: false, runValidators: true };

  id = data.id || id;
  data = Object.assign({ $unset: {} }, data || {});

  PostModel.schema
    .getPaths(['_id', '__v'])
    .filter(path => !(path in data))
    .forEach(path => data.$unset[path] = 1);

  return PostModel.findOneAndUpdate({ _id: id }, data, opts);
}

function create(data) {
  return new PostModel(data || {}).save();
}

function read(id) {
  return PostModel.findById(id);
}

function bulkRemovePosts(request, reply) {
  return helper
    .bulkRemove(request.payload)
    .then(responder.bulkRemovedSuccess(request, reply),
          responder.bulkRemovedFailure(request, reply));
}

function bulkUpdatePosts(request, reply) {
  return helper
    .bulkUpdate(request.payload)
    .then(responder.bulkUpdatedSuccess(request, reply),
          responder.bulkUpdatedFailure(request, reply));
}

function bulkReplacePosts(request, reply) {
  return helper
    .bulkReplace(request.payload)
    .then(responder.bulkReplacedSuccess(request, reply),
          responder.bulkReplacedFailure(request, reply));
}

function bulkCreatePosts(request, reply) {
  return helper
    .bulkCreate(request.payload)
    .then(responder.bulkCreatedSuccess(request, reply),
          responder.bulkCreatedFailure(request, reply));
}

function removePost(request, reply) {
  return remove(request.params.id)
    .then(responder.deletedSuccess(request, reply),
          responder.deletedFailure(request, reply));
}

function updatePost(request, reply) {
  return update(request.payload, request.params.id)
    .then(responder.updatedSuccess(request, reply),
          responder.updatedFailure(request, reply));
}

function replacePost(request, reply) {
  return replace(request.payload, request.params.id)
    .then(responder.replacedSuccess(request, reply),
          responder.replacedFailure(request, reply));
}

function createPost(request, reply) {
  return create(request.payload)
    .then(responder.createdSuccess(request, reply),
          responder.createdFailure(request, reply));
}

function readPost(request, reply) {
  return read(request.params.id)
    .then(responder.readSuccess(request, reply),
          responder.readFailure(request, reply));
}

module.exports = {
  bulkCreatePosts,
  bulkRemovePosts,
  bulkReplacePosts,
  bulkUpdatePosts,
  createPost,
  removePost,
  readPost,
  replacePost,
  searchViaGet,
  searchViaPost,
  updatePost
};
