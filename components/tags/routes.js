'use strict';

var tagsHelper = require('../tags/helper');

function tags (request, reply) {
    var redis  = request.server.app.redis
      , userId = request.params.userId;

    tagsHelper.get(redis, userId, function (err, data) {
        return err ? reply.boom(err) : reply(data);
    });
}

function removeTag (request, reply) {
    var redis  = request.server.app.redis
      , userId = request.params.userId
      , tag    = request.params.tag;

    tagsHelper.remove(redis, userId, tag, function (err, data) {
        return err ? reply.boom(err) : reply(data);
    })
}

module.exports = [{
    method  : 'GET'
  , path    : '/users/{userId}/tags'
  , handler : tags
}, {
    method  : 'DELETE'
  , path    : '/users/{userId}/tags/{tag}'
  , handler : removeTag
}];
