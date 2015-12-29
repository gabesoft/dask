'use strict';

const LIMIT = 1000;

const searcher = require('../searcher'),
      responder = require('../../core/responder'),
      indexer = require('../indexer'),
      ensureExists = require('../../core/handlers-helper').ensureExists,
      Subscription = require('../feed-subscription-model');

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

function search(data) {
  data = data || {};
  return searcher
    .search({
      body: data.query || {},
      _source: data.fields,
      sort: data.sort,
      from: data.skip || data.from || 0,
      size: data.limit || data.size || LIMIT
    })
    .then(results => results.hits);
}

function searchViaGet(request) {
  return search(request.query);
}

function searchViaPost(request) {
  return search(request.payload);
}

function readPost(request) {
  return searcher
    .search({ body: { query: { term: { _id: request.params.id } } } })
    .then(results => results.hits.hits[0]);
}

function createPost(request) {
  const params = request.params || {},
        data = request.payload || {},
        subscriptionId = params.subscriptionId,
        query = { _id: params.postId };

  return indexPosts(subscriptionId, query, data).then(results => results[0]);
}

function updatePost(request) {
  const params = request.params || {},
        data = request.payload || {},
        subscriptionId = params.subscriptionId,
        query = { _id: params.postId };

  return indexPosts(subscriptionId, query, data).then(results => results[0]);
}

function bulkCreatePosts(request) {
  const subscriptionId = request.params.subscriptionId,
        ids = request.payload.postIds || [],
        data = request.payload.data || {},
        query = ids.length > 0 ? { _id: { $in: ids } } : {};

  return indexPosts(subscriptionId, query, data);
}

function bulkRemovePosts(request) {
  return indexer.deletePosts(request.params.subscriptionId);
}

const methods = {
  createPost: { method: createPost, response: 'created' },
  updatePost: { method: updatePost, response: 'updated' },
  readPost: { method: readPost, response: 'read' },
  bulkCreatePosts: { method: bulkCreatePosts, response: 'bulkCreated' },
  bulkRemovePosts: { method: bulkRemovePosts, response: 'bulkRemoved' },
  searchViaGet: { method: searchViaGet, response: 'search' },
  searchViaPost: { method: searchViaPost, response: 'search' }
};

Object.keys(methods).forEach(name => {
  const data = methods[name];
  module.exports[name] = responder.decorate(data.method, data.response);
});
