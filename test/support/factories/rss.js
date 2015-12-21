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

module.exports = {
  makeFeed: data => fakery.make('feed', data || {}),
  makeFeedAndSave: data => fakery.makeAndSave('feed', data || {}),
  makePost: data => fakery.make('post', data || {}),
  makePostAndSave: data => fakery.makeAndSave('post', data || {})
};
