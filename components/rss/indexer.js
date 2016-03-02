'use strict';

const searcher = require('./searcher'),
      PostModel = require('./post-model'),
      trans = require('trans');

function makeUserPosts(subscription, posts, data, onlySubscription) {
  data = data || {};
  posts = posts || [];

  const len = posts.length,
        strId = obj => (obj.id || obj._id).toString(),
        subscriptionId = strId(subscription);

  let i = 0;

  for (i = 0; i < len; i++) {
    const post = posts[i];
    const postId = strId(post);
    if (post.feedId && post.feedId.toString() !== subscription.feedId.toString()) {
      throw new Error(`Post ${postId} does not belong to subscription ${subscriptionId}`);
    }
  }

  return trans(posts)
    .map('.', post => Object.assign({
      post: onlySubscription ? undefined : post,
      postId: strId(post),
      subscriptionId
    }, subscription, data[strId(post)] || data))
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
    .then(posts => {
      const opts = {
        body: { query: { term: { subscriptionId: subscription.id } } },
        fields: ['tags', 'postId']
      };
      const merge = (aData, bData) => {
        const union = new Set((aData || []).concat(bData || []));
        return Array.from(union);
      };

      return searcher.scroll(opts).then(docs => {
        const data = trans(docs)
                .mapf('fields.tags', tags => ({ tags: merge(tags, subscription.tags) }))
                .object('fields.postId', 'fields.tags', 'toString')
                .value();
        return makeUserPosts(subscription, posts, data, true);
      });
    })
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
