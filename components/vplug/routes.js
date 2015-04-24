'use strict';

var handler = require('./handlers');

function makeKey (key) {
    return 'vplugkeyword:' + key;
}

function setKeywords (request, reply) {
    var redis   = request.server.app.redis
      , payload = request.payload
      , data    = [];

    payload.forEach(function (d) {
        data.push(makeKey(d.key));
        data.push(JSON.stringify(d));
    });

    redis.mset(data, function (err, res) {
        return err ? reply.boom(err) : reply(res);
    });
}

function getKeywords (request, reply) {
    var redis = request.server.app.redis;

    redis.keys(makeKey('*'), function (err, keys) {
        if (err) return reply.boom(err);

        redis.mget(keys, function (err, data) {
            return err ? reply.boom(err) : reply(data.map(JSON.parse));
        });
    });
}

module.exports = [{
    method  : 'POST'
  , path    : '/vplugs'
  , handler : handler.create
}, {
    method  : 'GET'
  , path    : '/vplugs'
  , handler : handler.search
}, {
    method  : 'DELETE'
  , path    : '/vplugs/{id}'
  , handler : handler.remove
}, {
    method  : [ 'PUT', 'PATCH' ]
  , path    : '/vplugs/{id}'
  , handler : handler.update
}, {
    method  : 'POST'
  , path    : '/vplugkeywords'
  , handler : setKeywords
}, {
    method  : 'GET'
  , path    : '/vplugkeywords'
  , handler : getKeywords
}]
