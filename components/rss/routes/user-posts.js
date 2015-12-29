'use strict';

const handlers = require('../handlers/user-posts'),
      helper = require('../../core/routes-helper'),
      Joi = require('../../core/joi');

let routes = [{
  method: 'GET',
  path: '/user-posts/{id}',
  config: {
    handler: handlers.readPost,
    validate: { params: { id: Joi.userPostId() } }
  }
}, {
  method: 'POST',
  path: '/user-posts/{subscriptionId}/{postId}',
  config: {
    handler: handlers.createPost,
    validate: {
      params: {
        subscriptionId: Joi.objectId(),
        postId: Joi.objectId()
      },
      payload: Joi.object()
    }
  }
}, {
  method: 'PATCH',
  path: '/user-posts/{subscriptionId}/{postId}',
  config: {
    handler: handlers.updatePost,
    validate: {
      payload: Joi.object(),
      params: {
        subscriptionId: Joi.objectId(),
        postId: Joi.objectId()
      }
    }
  }
}, {
  method: 'DELETE',
  path: '/user-posts/{id}',
  config: {
    handler: handlers.removePost,
    validate: { params: { id: Joi.userPostId() } }
  }
}, {
  method: ['POST', 'PATCH'],
  path: '/bulk/user-posts/{subscriptionId}',
  config: {
    handler: handlers.bulkCreatePosts,
    validate: {
      params: { subscriptionId: Joi.objectId() },
      payload: { postIds: Joi.array(), data: Joi.object() }
    }
  }
}, {
  method: 'DELETE',
  path: '/bulk/user-posts/{subscriptionId}',
  config: {
    handler: handlers.bulkRemovePosts,
    validate: {
      params: { subscriptionId: Joi.objectId() }
    }
  }
}];

routes = routes.concat(helper.makeSearchRoutes('/user-posts', {
  searchViaGet: handlers.searchViaGet,
  searchViaPost: handlers.searchViaPost
}));

module.exports = routes;
