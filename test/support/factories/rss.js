'use strict';

const mongoose = require('mongoose'),
      fakery = require('mongoose-fakery'),
      searcher = require('../../../components/rss/searcher'),
      Promise = require('bluebird').Promise,
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
    const results = [];

    for (idx = 0; idx < count; idx++) {
      results.push(fn());
    }

    return results;
  }
  timesPromise(count, fn) {
    return Promise.all(this.times(count, fn));
  }
  makeAndSave(name, data) {
    data = data || {};
    return new Promise((resolve, reject) => {
      return fakery.makeAndSave(name, data || {}, (err, result) => err ? reject(err) : resolve(result));
    });
  }
}

class Factory extends BaseFactory {
  makeFeed(data) {
    return fakery.make('feed', data || {});
  }
  makePost(data) {
    return fakery.make('post', data || {});
  }
  makeUser(data) {
    return fakery.make('user', data || {});
  }
  makeSubscription(data) {
    return fakery.make('subscription', data || {});
  }
  makeUserPost(data) {
    data = data || {};
    const feed = this.makeFeed(data.feed || {}),
          post = this.makePost(Object.assign({ feedId: feed.get('id') }, data.post || {})),
          sub = this.makeSubscription(Object.assign({ feedId: feed.get('id') }, data.subscription || {}));
    return indexer.makeUserPosts(sub.toObject(), [post.toOBject()], data.userPost)[0];
  }
  makeFeeds(count, data) {
    return this.times(count, () => this.makeFeed(data));
  }
  makePosts(count, data) {
    return this.times(count, () => this.makePost(data));
  }

  makeFeedAndSave(data) {
    return this.makeAndSave('feed', data);
  }
  makePostAndSave(data) {
    return this.makeAndSave('post', data);
  }
  makeUserAndSave(data) {
    return this.makeAndSave('user', data);
  }
  makeSubscriptionAndSave(data) {
    return this.makeAndSave('subscription', data);
  }
  makeSubscriptionAndPostsAndSave(postCount, data) {
    data = data || {};
    return this
      .makeFeedAndSave(data.feed)
      .then(feed => {
        const feedId = feed.get('id');
        return Promise.all([
          this.makeSubscriptionAndSave(Object.assign({ feedId }, data.subscription || {})),
          this.makePostsAndSave(postCount, Object.assign({ feedId }, data.posts || {}))
        ]);
      })
      .then(results => {
        return { subscription: results[0], posts: results[1] };
      });
  }
  makeUserPostAndSave(data) {
    data = data || {};
    return this.makeFeedAndSave(data.feed)
      .then(feed => {
        const postData = Object.assign({ feedId: feed.get('id') }, data.post || {}),
              post = this.makePostAndSave(postData),
              subData = Object.assign({ feedId: feed.get('id') }, data.subscription || {}),
              sub = this.makeSubscriptionAndSave(subData);
        return Promise.all([sub, post]);
      })
      .then(results => {
        const sub = results[0],
              post = results[1],
              userPosts = indexer.makeUserPosts(sub.toObject(), [post.toObject()], data.userPost);
        return searcher.index(userPosts).then(objs => {
          return Object.assign(objs[0], { _source: userPosts[0] });
        });
      });
  }
  makeUserPostsAndSave(count, data) {
    data = data || {};
    return this.makeFeedAndSave(data.feed)
      .then(feed => {
        const subData = Object.assign({ feedId: feed.get('id') }, data.subscription || {}),
              postData = Object.assign({ feedId: feed.get('id') }, data.post || {}),
              sub = this.makeSubscriptionAndSave(subData),
              posts = this.makePostsAndSave(count, postData);
        return Promise.all([sub, posts]);
      })
      .then(results => {
        const sub = results[0].toObject(),
              posts = results[1].map(post => post.toObject()),
              userPosts = indexer.makeUserPosts(sub, posts, data.userPost);
        return searcher.index(userPosts).then(objs => {
          return objs.map((result, index) => Object.assign(result, { _source: userPosts[index] }));
        });
      });
  }
  makeFeedsAndSave(count, data) {
    return this.timesPromise(count, () => this.makeFeedAndSave(data));
  }
  makePostsAndSave(count, data) {
    return this.timesPromise(count, () => this.makePostAndSave(data));
  }
}

module.exports = new Factory();
