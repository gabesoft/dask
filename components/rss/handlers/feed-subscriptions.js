'use strict';

const SubscriptionModel = require('../feed-subscription-model'),
      FeedModel = require('../feed-model'),
      trans = require('trans'),
      indexer = require('../indexer'),
      searcher = require('../searcher'),
      responder = require('../../core/responder'),
      ensureExists = require('../../core/handlers-helper').ensureExists,
      Helper = require('../../core/handlers-helper').Helper,
      helper = new Helper(SubscriptionModel),
      QUERY = { query: { disabled: { $ne: true } } };

function addUnreadCounts(subscriptions) {
  subscriptions = Array.isArray(subscriptions) ? subscriptions : [subscriptions];

  if (subscriptions.length === 0) {
    return [];
  }

  const subIds = subscriptions.map(sub => (sub.id || sub._id)).filter(Boolean);

  return searcher
    .search({
      body: {
        size: 0,
        query: {
          bool: {
            must: [
              { term: { read: false } },
              { terms: { subscriptionId: subIds } }
            ]
          }
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
  return helper
    .search(data, QUERY)
    .then(subs => subs.map(sub => sub.toObject()))
    .then(subs => addUnreadCounts(subs));
}

function searchViaGet(request) {
  return search(request.query);
}

function searchViaPost(request) {
  return search(request.payload);
}

function createSubscription(request) {
  const data = Object.assign({ disabled: false }, request.payload || {}),
        userId = data.userId,
        feedId = data.feedId;

  return SubscriptionModel
    .findOne({ userId, feedId })
    .then(sub => {
      const title = data.title || (sub ? sub.get('title') : null);
      if (title) {
        return sub;
      } else {
        return FeedModel.findById(feedId)
          .then(feed => ensureExists(feed, FeedModel.modelName, feedId))
          .then(feed => data.title = feed.get('title'))
          .then(() => sub);
      }
    })
    .then(sub => sub ? sub.set(data).save() : helper.create(data))
    .then(sub => indexer
          .addPosts(sub.toObject(), null, { read: true })
          .then(() => sub));
}

function readSubscription(request) {
  return helper
    .read(request.params.id)
    .then(sub => addUnreadCounts(sub.toObject()));
}

function disableSubscription(request) {
  return SubscriptionModel
    .findById(request.params.id)
    .then(sub => ensureExists(sub, SubscriptionModel.modelName, request.params.id))
    .then(sub => sub.set('disabled', true).save())
    .then(sub => indexer.deletePosts(sub.get('id')).then(() => sub));
}

function deleteSubscription(request) {
  return helper
    .remove(request.params.id)
    .then(sub => indexer.deletePosts(sub.get('id')).then(() => sub));
}

function removeSubscription(request) {
  return (request.query || {}).soft
    ? disableSubscription(request)
    : deleteSubscription(request);
}

function updateSubscription(request) {
  return helper
    .update(request.payload, request.params.id)
    .then(sub => indexer
          .updateSubscriptionPosts(sub.toObject(), null, sub.oldData)
          .then(() => sub)
          .then(addUnreadCounts));
}

function replaceSubscription(request) {
  return helper
    .replace(request.payload, request.params.id)
    .then(sub => indexer.updateSubscriptionPosts(sub.toObject()).then(() => sub));
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
