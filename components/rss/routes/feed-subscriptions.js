'use strict';

const handlers = require('../handlers/feed-subscriptions'),
      Joi = require('../../core/joi'),
      helper = require('../../core/routes-helper');

let routes = [];

routes = routes.concat(helper.makeCrudRoutes('/feed-subscriptions', {
  create: handlers.createSubscription,
  read: handlers.readSubscription,
  remove: handlers.removeSubscription,
  replace: handlers.replaceSubscription,
  update: handlers.updateSubscription
}, {
  create: {
    payload: Joi.object().keys({
      userId: Joi.objectId(),
      feedId: Joi.objectId(),
      tags: Joi.array().items(Joi.string()),
      title: Joi.string()
    }).requiredKeys('userId', 'feedId')
  }
}));

routes = routes.concat(helper.makeSearchRoutes('/feed-subscriptions', {
  searchViaGet: handlers.searchViaGet,
  searchViaPost: handlers.searchViaPost
}));

module.exports = routes;
