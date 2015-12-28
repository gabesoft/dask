'use strict';

const searcher = require('../searcher'),
      responder = require('../../core/responder'),
      indexer = require('../indexer'),
      Subscription = require('../feed-subscription-model');

// TODO: implement search (add routes too)

function readPost(request, reply) {
  return searcher
    .search({
      body: {
        query: { term: { _id: request.params.id } }
      }
    })
    .then(results => results.hits.hits[0])
    .then(responder.readSuccess(request, reply),
          responder.readFailure(request, reply));
}

function ensureExists(doc, name, id) {
  if (doc) {
    return doc;
  } else {
    throw new Error(`A ${name} with id ${id} was not found`);
  }
}

function indexPosts(subscriptionId, query, data) {
  query = query || {};
  return Subscription
    .findById(subscriptionId)
    .lean()
    .then(sub => ensureExists(sub, 'subscription', subscriptionId))
    .then(sub => indexer.addPosts(sub, Object.assign({ feedId: sub.feedId }, query), data))
    .then(results => searcher.search({
      body: { query: { terms: { _id: results.map(result => result._id) } } }
    }))
    .then(results => results.hits.hits);
}

function createPost(request, reply) {
  const params = request.params || {},
        data = request.payload || {};

  return indexPosts(params.subscriptionId, { _id: params.postId }, data)
    .then(results => results[0])
    .then(responder.createdSuccess(request, reply),
          responder.createdFailure(request, reply));
}

function updatePost(request, reply) {
  const params = request.params || {},
        data = request.payload || {};

  return indexPosts(params.subscriptionId, { _id: params.postId }, data)
    .then(results => results[0])
    .then(responder.updatedSuccess(request, reply),
          responder.updatedFailure(request, reply));
}

function bulkCreatePosts(request, reply) {
  const subscriptionId = request.params.subscriptionId,
        ids = request.payload.postIds || [],
        data = request.payload.data || {},
        query = ids.length > 0 ? { _id: { $in: ids } } : {};

  return indexPosts(subscriptionId, query, data)
    .then(responder.bulkCreatedSuccess(request, reply),
          responder.bulkCreatedFailure(request, reply));
}

function bulkDeletePosts(request, reply) {
  const subscriptionId = request.params.subscriptionId;

  return indexer
    .deletePosts(subscriptionId)
    .then(responder.bulkRemovedSuccess(request, reply),
          responder.bulkRemovedFailure(request, reply));
}

module.exports = {
  createPost,
  updatePost,
  readPost,
  bulkCreatePosts,
  bulkDeletePosts
};
