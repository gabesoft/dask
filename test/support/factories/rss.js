'use strict';

const mongoose = require('mongoose'),
      fakery = require('mongoose-fakery');

require('../../../components/rss/feed-model');
require('../../../components/rss/post-model');

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
