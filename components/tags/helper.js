'use strict';

function key (userId) {
    return 'tags:' + userId;
}

function set (redis, userId, tags, cb) {
    cb   = cb || function() {};
    tags = tags || [];

    if (tags.length > 0) {
        redis.sadd(key(userId), tags, cb);
    }
}

function get (redis, userId, cb) {
    redis.smembers(key(userId), cb);
}

function remove (redis, userId, tag, cb) {
    redis.srem(key(userId), tag, cb);
}

module.exports = {
    set    : set
  , get    : get
  , remove : remove
};
