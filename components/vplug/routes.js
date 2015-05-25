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
        if (err) { return reply.boom(err); }

        if (keys.length === 0) { return reply(); }

        redis.mget(keys, function (err, data) {
            return err ? reply.boom(err) : reply(data.map(JSON.parse));
        });
    });
}

function delKeywords (request, reply) {
    var redis = request.server.app.redis;

    redis.keys(makeKey('*'), function (err, keys) {
        if (err) { return reply.boom(err); }

        if (keys.length === 0) { return reply(); }

        redis.del(keys, function(err, res) {
            return err ? reply.boom(err) : reply(res);
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
    method  : 'GET'
  , path    : '/vplugs/{id}'
  , handler : handler.read
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
    method  : 'DELETE'
  , path    : '/vplugkeywords'
  , handler : delKeywords
}, {
    method  : 'GET'
  , path    : '/vplugkeywords'
  , handler : getKeywords
}];
