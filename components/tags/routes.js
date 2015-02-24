'use strict';

var tagsModel = require('../tags/model');

function tags (request, reply) {
    var redis  = request.server.app.redis
      , userId = request.params.userId;

    tagsModel.get(redis, userId, function (err, data) {
        return err ? reply.boom(err) : reply(data);
    });
}

module.exports = [{
    method  : 'GET'
  , path    : '/users/{userId}/tags'
  , handler : tags
}];
