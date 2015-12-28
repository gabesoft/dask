'use strict';

const handlers = require('../handlers/posts'),
      helper = require('../../core/routes-helper');

let routes = [];

routes = routes.concat(helper.makeCrudRoutes('/feeds', {
  create: handlers.createFeed,
  read: handlers.readFeed,
  remove: handlers.removeFeed,
  replace: handlers.replaceFeed,
  update: handlers.updateFeed
}));

routes = routes.concat(helper.makeSearchRoutes('/feeds', {
  search: handlers.searchFeeds
}));

routes = routes.concat(helper.makeBulkRoutes('/feeds', {
  bulkCreate: handlers.bulkCreateFeeds,
  bulkRemove: handlers.bulkRemoveFeeds,
  bulkReplace: handlers.bulkReplaceFeeds,
  bulkUpdate: handlers.bulkUpdateFeeds
}));

module.exports = routes;
