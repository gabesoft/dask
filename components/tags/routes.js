'use strict';

const tagsHelper = require('../tags/helper');

function readTags(request, reply) {
  const redis = request.server.app.redis,
        userId = request.params.userId;

  tagsHelper.get(redis, userId, (err, data) => {
    return err ? reply.boom(err) : reply(data);
  });
}

function saveTags(request, reply) {
  const redis = request.server.app.redis,
        userId = request.params.userId;

  tagsHelper.set(redis, userId, request.payload, (err, data) => {
    return err ? reply.boom(err) : reply(data);
  });
}

function removeTag(request, reply) {
  const redis = request.server.app.redis,
        userId = request.params.userId,
        tag = request.params.tag;

  tagsHelper.remove(redis, userId, tag, (err, data) => {
    return err ? reply.boom(err) : reply(data);
  });
}

module.exports = [{
  method: 'GET',
  path: '/users/{userId}/tags',
  handler: readTags
}, {
  method: [ 'PUT', 'POST' ],
  path: '/users/{userId}/tags',
  handler: saveTags
}, {
  method: 'DELETE',
  path: '/users/{userId}/tags/{tag}',
  handler: removeTag
}];