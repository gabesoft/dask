'use strict';

const FeedModel = require('../feed-model'),
      responder = require('../../core/responder'),
      Promise = require('bluebird').Promise,
      capitalize = require('lodash').capitalize;

function searchFeeds(request, reply) {
  const rquery = request.query || {},
        payload = request.payload || {},
        query = rquery.query || payload.query || {},
        skip = (rquery.skip || rquery.from) || (payload.skip || payload.from) || 0,
        limit = (rquery.limit || rquery.size) || (payload.limit || payload.size) || 10000,
        sort = payload.sort,
        fields = rquery.fields || (Array.isArray(payload.fields) ? payload.fields.join(' ') : payload.fields);

  return FeedModel
    .find(query, fields)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .exec()
    .then(responder.searchSuccess(request, reply),
          responder.searchFailure(request, reply));
}

function remove(id) {
  return FeedModel.findById(id).then(doc => doc ? doc.remove() : null);
}

function update(data, id) {
  return FeedModel
    .findById(data.id || id)
    .then(doc => doc ? doc.set(data || {}).save() : null);
}

function replace(data, id) {
  const opts = { new: true, upsert: false, runValidators: true };

  id = data.id || id;
  data = Object.assign({ $unset: {} }, data || {});

  FeedModel.schema
    .getPaths(['_id', '__v'])
    .filter(path => !(path in data))
    .forEach(path => data.$unset[path] = 1);

  return FeedModel.findOneAndUpdate({ _id: id }, data, opts);
}

function create(data) {
  return new FeedModel(data || {}).save();
}

function read(id) {
  return FeedModel.findById(id);
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

function bulkRemoveFeeds(request, reply) {
  return bulk(request, reply, remove);
}

function bulkUpdateFeeds(request, reply) {
  return bulk(request, reply, update);
}

function bulkReplaceFeeds(request, reply) {
  return bulk(request, reply, replace);
}

function bulkCreateFeeds(request, reply) {
  return bulk(request, reply, create);
}

function deleteFeed(request, reply) {
  return remove(request.params.id)
    .then(responder.deletedSuccess(request, reply),
          responder.deletedFailure(request, reply));
}

function updateFeed(request, reply) {
  return update(request.payload, request.params.id)
    .then(responder.updatedSuccess(request, reply),
          responder.updatedFailure(request, reply));
}

function replaceFeed(request, reply) {
  return replace(request.payload, request.params.id)
    .then(responder.replacedSuccess(request, reply),
          responder.replacedFailure(request, reply));
}

function createFeed(request, reply) {
  return create(request.payload)
    .then(responder.createdSuccess(request, reply),
          responder.createdFailure(request, reply));
}

function readFeed(request, reply) {
  return read(request.params.id)
    .then(responder.readSuccess(request, reply),
          responder.readFailure(request, reply));
}

module.exports = {
  bulkCreateFeeds,
  bulkRemoveFeeds,
  bulkReplaceFeeds,
  bulkUpdateFeeds,
  createFeed,
  deleteFeed,
  readFeed,
  replaceFeed,
  searchFeeds,
  updateFeed
};
