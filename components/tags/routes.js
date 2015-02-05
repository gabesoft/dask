'use strict';

function tags (request, reply) {
    var redis = request.server.app.redis;

    redis.smembers('tags', function (err, data) {
        return err ? reply.boom(err) : reply(data);
    });
}

module.exports = [{
    method  : 'GET'
  , path    : '/tags'
  , handler : tags
}];
