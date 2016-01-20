'use strict';

const searcher = require('./searcher'),
      PostModel = require('./post-model'),
      trans = require('trans');

function makeUserPosts(subscription, posts, data, onlySubscription) {
  data = data || {};
  posts = posts || [];

  const len = posts.length,
        subId = subscription.id || subscription._id;

  let i = 0;

  for (i = 0; i < len; i++) {
    const post = posts[i];
    if (post.feedId && post.feedId.toString() !== subscription.feedId.toString()) {
      throw new Error(`Post ${post.id || post._id} does not belong to subscription ${subId}`);
    }
  }

  return trans(posts)
    .map('.', post => Object.assign({
      post: onlySubscription ? undefined : post,
      postId: post.id || post._id,
      subscriptionId: subscription.id || subscription._id
    }, subscription, data))
    .remove('id',
            '_id',
            'enabled',
            'disabled',
            'post.id',
            'post._id',
            'post.pubdate',
            'post.feedId')
    .value();
}

function addPosts(subscription, query, data) {
  if (!subscription) {
    throw new Error('No subscription specified');
  }
  return PostModel
    .find(query || { feedId: subscription.feedId })
    .lean()
    .then(posts => makeUserPosts(subscription, posts, data))
    .then(docs => searcher.index(docs));
}

function updateSubscription(subscription, query) {
  return PostModel
    .find(query || { feedId: subscription.feedId }, { id: 1 })
    .lean()
    .then(posts => makeUserPosts(subscription, posts, null, true))
    .then(docs => searcher.update(docs));
}

function deletePosts(subscriptionId) {
  const opts = {
    body: { query: { term: { subscriptionId } } },
    fields: []
  };

  return searcher.scroll(opts).then(docs => searcher.remove(docs));
}

module.exports = {
  addPosts,
  deletePosts,
  makeUserPosts,
  updateSubscription
};
