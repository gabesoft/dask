'use strict';

const handlers = require('../handlers/posts');

module.exports = [{
  method: 'GET',
  path: '/posts/{id}',
  handler: handlers.readPost
}, {
  method: 'POST',
  path: '/posts',
  handler: handlers.createPost
}, {
  method: 'PUT',
  path: '/posts/{id}',
  handler: handlers.replacePost
}, {
  method: 'PATCH',
  path: '/posts/{id}',
  handler: handlers.updatePost
}, {
  method: 'DELETE',
  path: '/posts/{id}',
  handler: handlers.deletePost
}, {
  method: 'GET',
  path: '/search/posts',
  handler: handlers.searchPosts
}, {
  method: 'POST',
  path: '/search/posts',
  handler: handlers.searchPosts
}, {
  method: 'POST',
  path: '/bulk/posts',
  handler: handlers.bulkCreatePosts
}, {
  method: 'PUT',
  path: '/bulk/posts',
  handler: handlers.bulkReplacePosts
}, {
  method: 'PATCH',
  path: '/bulk/posts',
  handler: handlers.bulkUpdatePosts
}, {
  method: 'DELETE',
  path: '/bulk/posts',
  handler: handlers.bulkDeletePosts
}];
