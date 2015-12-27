'use strict';

const handlers = require('../handlers/posts'),
      Joi = require('../../core/joi');

module.exports = [{
  method: 'GET',
  path: '/posts/{id}',
  config: {
    handler: handlers.readPost,
    validate: {
      params: { id: Joi.objectId() }
    }
  }
}, {
  method: 'POST',
  path: '/posts',
  handler: handlers.createPost
}, {
  method: 'PUT',
  path: '/posts/{id}',
  config: {
    handler: handlers.replacePost,
    validate: {
      params: { id: Joi.objectId() }
    }
  }
}, {
  method: 'PATCH',
  path: '/posts/{id}',
  config: {
    handler: handlers.updatePost,
    validate: {
      params: { id: Joi.objectId() }
    }
  }
}, {
  method: 'DELETE',
  path: '/posts/{id}',
  config: {
    handler: handlers.deletePost,
    validate: {
      params: { id: Joi.objectId() }
    }
  }
}, {
  method: 'GET',
  path: '/search/posts',
  handler: handlers.searchPosts
}, {
  method: 'POST',
  path: '/search/posts',
  config: {
    handler: handlers.searchPosts,
    validate: {
      payload: Joi
        .object()
        .pattern(/query|fields|sort|skip|from|limit|size/, Joi.any())
    }
  }
}, {
  method: 'POST',
  path: '/bulk/posts',
  config: {
    handler: handlers.bulkCreatePosts,
    validate: { payload: Joi.array() }
  }
}, {
  method: 'PUT',
  path: '/bulk/posts',
  config: {
    handler: handlers.bulkReplacePosts,
    validate: { payload: Joi.array() }
  }
}, {
  method: 'PATCH',
  path: '/bulk/posts',
  config: {
    handler: handlers.bulkUpdatePosts,
    validate: { payload: Joi.array() }
  }
}, {
  method: 'DELETE',
  path: '/bulk/posts',
  config: {
    handler: handlers.bulkRemovePosts,
    validate: { payload: Joi.array().items(Joi.objectId()) }
  }
}];
