'use strict';

const useRedis = require('../../redis.js').useClient;

function key(userId) {
  return 'tags:' + userId;
}

function set(userId, tags, cb) {
  cb = cb || (() => {});
  tags = tags || [];

  if (tags.length > 0) {
    useRedis(client => client.saddAsync(key(userId), tags), cb);
  }
}

function get(userId, cb) {
  useRedis(client => client.smembersAsync(key(userId)), cb);
}

function remove(userId, tag, cb) {
  useRedis(client => client.sremAsync(key(userId), tag), cb);
}

module.exports = {
  set: set,
  get: get,
  remove: remove
};
