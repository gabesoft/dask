'use strict';

function key (userId) {
    return 'tags:' + userId;
}

function set (redis, userId, tags, cb) {
    cb   = cb || function() {};
    tags = tags || [];

    if (tags.length > 0) {
        redis.sadd(key(userId), tags, function (err, data) {
            if (err) {
                console.log('failed to save tags', tags, err);
            }
            cb(err, data);
        });
    }
}

function get (redis, userId, cb) {
    redis.smembers(key(userId), cb);
}

module.exports = {
    set : set
  , get : get
};
