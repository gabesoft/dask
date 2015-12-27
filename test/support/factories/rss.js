'use strict';

const mongoose = require('mongoose'),
      fakery = require('mongoose-fakery'),
      searcher = require('../../../components/rss/searcher'),
      indexer = require('../../../components/rss/indexer');

require('../../../components/rss/feed-model');
require('../../../components/rss/post-model');
require('../../../components/rss/feed-subscription-model');
require('../../../components/users/user-model');

fakery.fake('feed', mongoose.model('Feed'), {
  author: fakery.g.name(),
  date: new Date().toString(),
  pubdate: new Date().toString(),
  link: fakery.g.alphanum(32),
  uri: fakery.g.alphanum(32),
  title: fakery.g.alphanum(32)
});

fakery.fake('post', mongoose.model('Post'), {
  author: fakery.g.name(),
  date: new Date().toString(),
  pubdate: Date.now().toString(),
  guid: fakery.g.alphanum(32),
  feedId: fakery.make('feed').get('id'),
  link: fakery.g.alphanum(32),
  title: fakery.g.alphanum(32)
});

fakery.fake('user', mongoose.model('User'), {
  email: fakery.g.name(),
  password: fakery.g.alphanum(32),
  type: 'test'
});

fakery.fake('subscription', mongoose.model('FeedSubscription'), {
  userId: fakery.make('user').get('id'),
  feedId: fakery.make('feed').get('id'),
  title: fakery.g.alphanum(32),
  tags: []
});

class BaseFactory {
  times(count, fn) {
    let idx = 0;
    const res = [];

    for (idx = 0; idx < count; idx++) {
      res.push(fn());
    }

    return res;
  }
}

class Factory extends BaseFactory {
  makeFeed(data) {
    return fakery.make('feed', data || {});
  }
  makeFeedAndSave(data) {
    return fakery.makeAndSave('feed', data || {});
  }
  makePost(data) {
    return fakery.make('post', data || {});
  }
  makePostAndSave(data) {
    return fakery.makeAndSave('post', data || {});
  }
  makeUser(data) {
    return fakery.make('user', data || {});
  }
  makeUserAndSave(data) {
    return fakery.makeAndSave('user', data || {});
  }
  makeSubscription(data) {
    return fakery.make('subscription', data || {});
  }
  makeSubscriptionAndSave(data, cb) {
    return fakery.makeAndSave('subscription', data || {}, cb);
  }
  makeUserPost(data) {
    data = data || {};
    const feed = this.makeFeed(data.feed || {}),
          post = this.makePost(Object.assign({ feedId: feed.get('id') }, data.post || {})),
          sub = this.makeSubscription(Object.assign({ feedId: feed.get('id') }, data.subscription || {}));
    return indexer.makeUserPosts(sub.toObject(), [post.toOBject()], data.userPost)[0];
  }
  makeUserPostAndSave(data) {
    data = data || {};
    const feed = this.makeFeedAndSave(data.feed || {}),
          post = this.makePostAndSave(Object.assign({ feedId: feed.get('id') }, data.post || {})),
          sub = this.makeSubscriptionAndSave(Object.assign({ feedId: feed.get('id') }, data.subscription || {})),
          userPosts = indexer.makeUserPosts(sub.toObject(), [post.toObject()], data.userPost);
    return searcher.index(userPosts).then(results => {
      return Object.assign(results[0], { _source: userPosts[0] });
    });
  }
  makeUserPostsAndSave(count, data) {
    data = data || {};
    const feed = this.makeFeedAndSave(data.feed || {}),
          posts = this.makePostsAndSave(count, Object.assign({ feedId: feed.get('id') }, data.post || {})),
          sub = this.makeSubscriptionAndSave(Object.assign({ feedId: feed.get('id') }, data.subscription || {})),
          userPosts = indexer.makeUserPosts(sub.toObject(), posts.map(post => post.toObject()), data.userPost);
    return searcher.index(userPosts).then(results => {
      return results.map((result, index) => Object.assign(result, { _source: userPosts[index] }));
    });
  }
  makeFeeds(count, data) {
    return this.times(count, () => this.makeFeed(data));
  }
  makePosts(count, data) {
    return this.times(count, () => this.makePost(data));
  }
  makeFeedsAndSave(count, data) {
    return this.times(count, () => this.makeFeedAndSave(data));
  }
  makePostsAndSave(count, data) {
    return this.times(count, () => this.makePostAndSave(data));
  }
}

module.exports = new Factory();
