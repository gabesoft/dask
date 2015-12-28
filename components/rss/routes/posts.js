'use strict';

const handlers = require('../handlers/posts'),
      helper = require('../../core/routes-helper');

let routes = [];

routes = routes.concat(helper.makeCrudRoutes('/posts', {
  create: handlers.createPost,
  read: handlers.readPost,
  remove: handlers.removePost,
  replace: handlers.replacePost,
  update: handlers.updatePost
}));

routes = routes.concat(helper.makeSearchRoutes('/posts', {
  searchViaGet: handlers.searchViaGet,
  searchViaPost: handlers.searchViaPost
}));

routes = routes.concat(helper.makeBulkRoutes('/posts', {
  bulkCreate: handlers.bulkCreatePosts,
  bulkRemove: handlers.bulkRemovePosts,
  bulkReplace: handlers.bulkReplacePosts,
  bulkUpdate: handlers.bulkUpdatePosts
}));

module.exports = routes;
