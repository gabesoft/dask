'use strict';

const handlers = require('../handlers/feeds'),
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
  searchViaGet: handlers.searchViaGet,
  searchViaPost: handlers.searchViaPost
}));

routes = routes.concat(helper.makeBulkRoutes('/feeds', {
  bulkCreate: handlers.bulkCreateFeeds,
  bulkRemove: handlers.bulkRemoveFeeds,
  bulkReplace: handlers.bulkReplaceFeeds,
  bulkUpdate: handlers.bulkUpdateFeeds
}));

module.exports = routes;
