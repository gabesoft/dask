'use strict';

const handlers = require('../handlers/post-queries'),
      Joi = require('../../core/joi'),
      helper = require('../../core/routes-helper');

let routes = [];
const schema = Joi.object().keys({
  _id: Joi.string().optional(),
  id: Joi.string().optional(),
  userId: Joi.string(),
  title: Joi.string().allow('').optional(),
  ast: Joi.any(),
  data: Joi.object(),
  text: Joi.string(),
  userText: Joi.string().allow('').optional(),
  pin: Joi.number(),
  lastUsed: Joi.date().optional()
});

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
  replace: { params: { id: Joi.string() }, payload: schema },
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
