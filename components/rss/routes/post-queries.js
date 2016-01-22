'use strict';

const handlers = require('../handlers/post-queries'),
      Joi = require('../../core/joi'),
      helper = require('../../core/routes-helper');

let routes = [];
const schema = {
  _id: Joi.string(),
  userId: Joi.string(),
  title: Joi.string(),
  ast: Joi.any(),
  data: Joi.object(),
  text: Joi.string(),
  pin: Joi.number()
};

routes = routes.concat(helper.makeCrudRoutes('/post-queries', {
  create: handlers.createQuery,
  read: handlers.readQuery,
  remove: handlers.removeQuery,
  replace: handlers.replaceQuery,
  update: handlers.updateQuery
}, {
  create: { payload: schema },
  read: { params: { id: Joi.string() } },
  remove: { params: { id: Joi.string() } },
  replace: { params: { id: Joi.string() } },
  update: { params: { id: Joi.string() }, payload: schema }
}));

routes = routes.concat(helper.makeSearchRoutes('/post-queries', {
  searchViaGet: handlers.searchViaGet,
  searchViaPost: handlers.searchViaPost
}));

routes = routes.concat(helper.makeBulkRoutes('/post-queries', {
  bulkCreate: handlers.bulkCreateQueries,
  bulkRemove: handlers.bulkRemoveQueries,
  bulkReplace: handlers.bulkReplaceQueries,
  bulkUpdate: handlers.bulkUpdateQueries
}));

module.exports = routes;
