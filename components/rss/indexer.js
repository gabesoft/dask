const searcher = require('./searcher'),
      PostModel = require('./post-model'),
      trans = require('trans');

function makePostDocuments(subscription, posts, opts) {
  opts = opts || {};

  return trans(posts)
    .map('.', post => Object.assign({
      post: opts.onlySubscription ? undefined : post,
      postId: post.id || post._id,
      subscriptionId: subscription.id || subscription._id,
      read: opts.read
    }, subscription))
    .remove('id', '_id', 'enabled', 'disabled', 'post.id', 'post._id', 'post.feedId')
    .value();
}

function addPosts(subscription, query, read) {
  return PostModel
    .find(query || { feedId: subscription.feedId })
    .lean()
    .then(posts => makePostDocuments(subscription, posts, { read }))
    .then(docs => searcher.index(docs));
}

function updateSubscription(subscription, query) {
  const opts = { onlySubscription: true };

  return PostModel
    .find(query || { feedId: subscription.feedId }, { id: 1 })
    .lean()
    .then(posts => makePostDocuments(subscription, posts, opts))
    .then(docs => searcher.update(docs));
}

function deletePosts(subscription) {
  const opts = {
    body: { query: { term: { feedId: subscription.feedId } } },
    fields: []
  };

  return searcher.scroll(opts).then(docs => searcher.remove(docs));
}

module.exports = {
  addPosts: addPosts,
  deletePosts: deletePosts,
  updateSubscription: updateSubscription
};
