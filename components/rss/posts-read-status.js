'use strict';

const useRedis = require('../../redis').useClient;

module.exports = class PostsReadStatus {
  makeKey(userId) {
    return `read-posts:${userId}`;
  }

  markAsReadMulti(data, cb) {
    useRedis(client => {
      const multi = client.multi();
      data.forEach(x => multi.sadd(this.makeKey(x.userId), x.ids));
      return multi.execAsync();
    }, cb);
  }

  markAsUnreadMulti(data, cb) {
    useRedis(client => {
      const multi = client.multi();
      data.forEach(x => multi.srem(this.makeKey(x.userId), x.ids));
      return multi.execAsync();
    }, cb);
  }

  readState(userId, ids, cb) {
    useRedis(client => {
      const multi = client.multi();
      ids.forEach(id => multi.sismember(this.makeKey(userId), id));
      return multi.execAsync().then(data => {
        return ids.reduce((acc, id, index) => {
          return Object.assign(acc, { id: Boolean(data[index]) });
        }, {});
      });
    }, cb);
  }

  readCount(userId, cb) {
    useRedis(client => client.scardAsync(this.makeKey(userId)), cb);
  }

  readIds(userId, cb) {
    useRedis(client => client.smembersAsync(this.makeKey(userId)), cb);
  }

  markAsRead(userId, ids, cb) {
    this.markAsReadMulti([{ userId, ids }], cb);
  }

  markAsUnread(userId, ids, cb) {
    this.markAsUnreadMulti([{ userId, ids }], cb);
  }
};
