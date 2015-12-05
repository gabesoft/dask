'use strict';

module.exports = class PostsReadStatus {
  constructor(redis) {
    this.db = redis;
  }

  makeKey(userId) {
    return `read-posts:${userId}`;
  }

  markAsReadMulti(data, cb) {
    const multi = this.db.multi();
    data.forEach(x => multi.sadd(this.makeKey(x.userId), x.ids));
    multi.exec(cb);
  }

  markAsUnreadMulti(data, cb) {
    const multi = this.db.multi();
    data.forEach(x => multi.srem(this.makeKey(x.userId), x.ids));
    multi.exec(cb);
  }

  readState(userId, ids, cb) {
    const multi = this.db.multi();
    ids.forEach(id => multi.sismember(this.makeKey(userId), id));
    multi.exec((err, data) => {
      if (err) {
        return cb(err);
      }

      const results = ids.reduce((acc, id, index) => {
        return Object.assign(acc, { id: Boolean(data[index]) });
      }, {});

      cb(null, results);
    });
  }

  readCount(userId, cb) {
    this.db.scard(this.makeKey(userId), cb);
  }

  readIds(userId, cb) {
    this.db.smembers(this.makeKey(userId), cb);
  }

  markAsRead(userId, ids, cb) {
    this.markAsReadMulti([{ userId, ids }], cb);
  }

  markAsUnread(userId, ids, cb) {
    this.markAsUnreadMulti([{ userId, ids }], cb);
  }
};
