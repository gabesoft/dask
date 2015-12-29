'use strict';

const SubscriptionModel = require('../feed-subscription-model'),
      trans = require('trans'),
      indexer = require('../indexer'),
      searcher = require('../searcher'),
      responder = require('../../core/responder'),
      ensureExists = require('../../core/handlers-helper').ensureExists,
      Helper = require('../../core/handlers-helper').Helper,
      helper = new Helper(SubscriptionModel),
      QUERY = { query: { disabled: { $ne: true } } };

function addUnreadCounts(subscriptions) {
  return searcher
    .search({
      body: {
        size: 0,
        query: {
          term: { read: false }
        },
        filter: {
          or: subscriptions.map(sub => ({ term: { subscriptionId: sub.id } }))
        },
        aggs: {
          countsPerFeed: {
            terms: { field: 'feedId', size: 0 }
          }
        }
      },
      searchType: 'count'
    })
    .then(results => {
      const aggs = results.aggregations.countsPerFeed,
            buckets = (aggs || {}).buckets || [],
            counts = trans(buckets).object('key', 'doc_count').value();

      return trans(subscriptions)
        .mapff('feedId', 'unreadCount', counts)
        .value();
    });
}

function search(data) {
  return helper.search(data, QUERY).then(subs => addUnreadCounts(subs));
}

function searchViaGet(request) {
  return search(request.query);
}

function searchViaPost(request) {
  return search(request.payload);
}

function createSubscription(request) {
  const data = request.payload || {},
        userId = data.userId,
        feedId = data.feedId;

  return SubscriptionModel
    .findOne({ userId, feedId })
    .then(sub => sub.set('disabled', false).save() || helper.create(request.payload))
    .then(sub => indexer.addPosts(sub.toObject(), null, { read: true }).then(() => sub));
}

function readSubscription(request) {
  return helper.read(request.params.id).then(sub => addUnreadCounts([sub]));
}

function removeSubscription(request) {
  return helper
    .remove(request.params.id)
    .then(sub => ensureExists(sub, SubscriptionModel.modelName, request.params.id))
    .then(sub => sub.set('disabled', true).save())
    .then(sub => indexer.deletePosts(sub.get('id')).then(() => sub));
}

function updateSubscription(request) {
  return helper
    .update(request.payload, request.params.id)
    .then(sub => indexer.updateSubscription(sub.toObject()).then(() => sub));
}

function replaceSubscription(request) {
  return helper
    .replace(request.payload, request.params.id)
    .then(sub => indexer.updateSubscription(sub.toObject()).then(() => sub));
}

const methods = {
  removeSubscription: { method: removeSubscription, response: 'removed' },
  updateSubscription: { method: updateSubscription, response: 'updated' },
  replaceSubscription: { method: replaceSubscription, response: 'replaced' },
  createSubscription: { method: createSubscription, response: 'created' },
  readSubscription: { method: readSubscription, response: 'read' },
  searchViaPost: { method: searchViaPost, response: 'search' },
  searchViaGet: { method: searchViaGet, response: 'search' }
};

Object.keys(methods).forEach(name => {
  const data = methods[name];
  module.exports[name] = responder.decorate(data.method, data.response);
});
