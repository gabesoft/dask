'use strict';

const tagsHelper = require('../tags/helper');

function readTags(request, reply) {
  const userId = request.params.userId;

  tagsHelper.get(userId, (err, data) => {
    return err ? reply.boom(err) : reply(data);
  });
}

function saveTags(request, reply) {
  const userId = request.params.userId;

  tagsHelper.set(userId, request.payload, (err, data) => {
    return err ? reply.boom(err) : reply(data);
  });
}

function removeTag(request, reply) {
  const userId = request.params.userId,
        tag = request.params.tag;

  tagsHelper.remove(userId, tag, (err, data) => {
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
