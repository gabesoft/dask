'use strict';

const PostModel = require('../post-model'),
      responder = require('../../core/responder'),
      Promise = require('bluebird').Promise,
      capitalize = require('lodash').capitalize;

function searchPosts(request, reply) {
  const rquery = request.query || {},
        payload = request.payload || {},
        query = rquery.query || payload.query || {},
        skip = (rquery.skip || rquery.from) || (payload.skip || payload.from) || 0,
        limit = (rquery.limit || rquery.size) || (payload.limit || payload.size) || 10000,
        sort = payload.sort,
        fields = rquery.fields || (Array.isArray(payload.fields) ? payload.fields.join(' ') : payload.fields);

  return PostModel
    .find(query, fields)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .exec()
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

function bulk(request, reply, op) {
  const method = `bulk${capitalize(op.name)}d`,
        promises = (request.payload || [])
          .map(op)
          .map(promise => Promise.resolve(promise).reflect());

  return Promise
    .all(promises)
    .map(promise => promise.isFulfilled() ? promise.value() : promise.reason())
    .then(responder[`${method}Success`](request, reply),
          responder[`${method}Failure`](request, reply));
}

function bulkRemovePosts(request, reply) {
  return bulk(request, reply, remove);
}

function bulkUpdatePosts(request, reply) {
  return bulk(request, reply, update);
}

function bulkReplacePosts(request, reply) {
  return bulk(request, reply, replace);
}

function bulkCreatePosts(request, reply) {
  return bulk(request, reply, create);
}

function deletePost(request, reply) {
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
  deletePost,
  readPost,
  replacePost,
  searchPosts,
  updatePost
};
