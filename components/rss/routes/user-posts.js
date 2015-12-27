'use strict';

const handlers = require('../handlers/user-posts'),
      Joi = require('../../core/joi');

module.exports = [{
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
      params: {
        subscriptionId: Joi.objectId(),
        postId: Joi.objectId()
      },
      payload: Joi.object()
    }
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
    handler: handlers.bulkDeletePosts,
    validate: {
      params: { subscriptionId: Joi.objectId() }
    }
  }
}];
