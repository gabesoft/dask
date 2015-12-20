'use strict';

const indexer = require('../indexer'),
      searcher = require('../searcher'),
      trans = require('trans'),
      RecordNotFound = require('../../core/errors/record-not-found'),
      FeedSubModel = require('../feed-subscription-model');

function notFound(id) {
  return new RecordNotFound('FeedSubscription', { id });
}

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

function findSubscriptions(query, fields) {
  return FeedSubModel
    .find(query, fields)
    .then(docs => docs.map(doc => doc.toObject()))
    .then(docs => addUnreadCounts(docs));
}

function subscriptionsQuery(request) {
  const query = { disabled: { $ne: true } },
        addif = (opts, name) => {
          if (opts[name]) {
            query[name] = opts[name];
          }
        };

  addif(request.query, 'userId');
  addif(request.params, 'userId');
  addif(request.query, 'feedId');
  addif(request.params, 'feedId');

  return query;
}

function createSubscription(request, reply) {
  const data = request.payload,
        userId = request.params.userId || data.userId,
        feedId = data.feedId;

  FeedSubModel
    .findOne({ userId, feedId })
    .then(doc => doc || new FeedSubModel())
    .then(doc => {
      doc.set(data);
      doc.set('disabled', false);
      doc.save(err => {
        if (err) {
          reply.boom(err);
        } else {
          reply(doc.toObject());
          indexer.addPosts(doc.toObject(), null, true);
        }
      });
    }, e => reply.boom(e));
}

function removeSubscription(request, reply) {
  FeedSubModel
    .findById(request.params.id)
    .then(doc => {
      if (!doc) {
        throw notFound(request.params.id);
      }

      doc.set('disabled', true);
      doc.save(err => {
        if (err) {
          reply.boom(err);
        } else {
          reply(doc.toObject());
          indexer.deletePosts(doc.toObject());
        }
      });
    }, e => reply.boom(e));
}

function updateSubscription(request, reply) {
  FeedSubModel
    .findById(request.params.id)
    .then(doc => {
      if (!doc) {
        throw notFound(request.params.id);
      }

      doc.set('tags', request.payload.tags || []);
      doc.set(request.payload || {});
      doc.save(err => {
        if (err) {
          reply.boom(err);
        } else {
          reply(doc.toObject());
          indexer.updateSubscription(doc.toObject());
        }
      });
    }, e => reply.boom(e));
}

function getFeedSubscription(request, reply) {
  const query = subscriptionsQuery(request),
        fields = (request.query.fields || '').split('~').join(' ');

  findSubscriptions(query, fields).then(data => reply(data[0]), e => reply.boom(e));
}

function getFeedSubscriptions(request, reply) {
  const query = subscriptionsQuery(request),
        fields = (request.query.fields || '').split('~').join(' ');

  findSubscriptions(query, fields).then(reply, e => reply.boom(e));
}

function indexPosts(request, reply) {
  const query = { _id: { $in: request.payload.postIds } },
        read = request.payload.read;

  FeedSubModel
    .findById(request.payload.subscriptionId)
    .lean()
    .then(subscription => indexer.addPosts(subscription, query, read))
    .then(reply, e => reply.boom(e));
}

module.exports = {
  createSubscription: createSubscription,
  getFeedSubscription: getFeedSubscription,
  getFeedSubscriptions: getFeedSubscriptions,
  indexPosts: indexPosts,
  removeSubscription: removeSubscription,
  updateSubscription: updateSubscription
};
