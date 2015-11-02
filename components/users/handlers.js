'use strict';

const User = require('./user-model'),
      RecordNotFoundError = require('../core/errors/record-not-found'),
      GuidExpiredError = require('../core/errors/guid-expired'),
      url = require('url');

function create(request, reply) {
  const data = request.payload || {},
        user = new User(data),
        uri = request.url;

  user.save((err) => {
    if (err && err.name === 'MongoError' && err.code === 11000) {
      reply.conflict(err);
    } else if (err && err.name === 'ValidationError') {
      reply.badRequest(err);
    } else if (err) {
      reply.boom(err);
    } else {
      uri.pathname = [uri.pathname, user.id].join('/');
      reply.created(user.toObject(), url.format(uri));
    }
  });
}

function update(request, reply) {
  User.findOne({
    _id: request.params.id
  }, (err, user) => {
    if (err && err.name === 'CastError') {
      return reply.badRequest(err);
    } else if (err) {
      return reply.boom(err);
    } else if (!user) {
      return reply.boom(new RecordNotFoundError('user', request.params.id));
    }

    user.set(request.payload || {});
    user.save((err) => {
      if (err) {
        reply.boom(err);
      } else {
        reply(user.toObject());
      }
    });
  });
}

function findOne(request, reply, query) {
  User.findOne(query, (err, user) => {
    if (err && err.name === 'CastError') {
      reply.badRequest(err);
    } else if (err) {
      reply.boom(err);
    } else if (!user) {
      reply.boom(new RecordNotFoundError('user', query));
    } else {
      reply(user.toObject());
    }
  });
}

function find(request, reply, query) {
  User.find(query, (err, users) => {
    if (err && err.name === 'CastError') {
      reply.badRequest(err);
    } else if (err) {
      reply.boom(err);
    } else {
      reply(users.map((u) => {
        return u.toObject();
      }));
    }
  });
}

function read(request, reply) {
  findOne(request, reply, {
    _id: request.params.id
  });
}

function search(request, reply) {
  if (request.query.guid) {
    findByGuid(request, reply);
  } else {
    find(request, reply, request.query);
  }
}

function remove(request, reply) {
  User.remove({
    _id: request.params.id
  }, (err) => {
    if (err && err.name === 'CastError') {
      reply.badRequest(err);
    } else if (err) {
      reply.boom(err);
    } else {
      reply({
        status: 'user-deleted',
        id: request.params.id
      });
    }
  });
}

function link(request, reply) {
  const guid = request.payload.guid,
        ttlInSeconds = request.payload.ttlInSeconds,
        userId = request.payload.userId,
        redis = request.server.app.redis,
        key = 'user-' + guid;

  redis.multi()
    .set(key, userId)
    .expire(key, ttlInSeconds)
    .exec((err, result) => {
      if (err) {
        return reply.boom(err);
      }

      reply({
        status: 'link-created',
        userId: userId,
        guid: guid
      });
    });
}

function findByGuid(request, reply) {
  const guid = request.query.guid,
        key = 'user-' + guid,
        redis = request.server.app.redis;

  redis.get(key, (err, userId) => {
    if (err) {
      reply.boom(err);
    } else if (!userId) {
      reply.boom(new GuidExpiredError(guid));
    } else {
      findOne(request, reply, {
        _id: userId
      });
    }
  });
}

module.exports = {
  create: create,
  read: read,
  update: update,
  remove: remove,
  search: search,
  link: link
};