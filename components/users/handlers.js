'use strict';

const User = require('./user-model'),
      RecordNotFound = require('../core/errors/record-not-found'),
      GuidExpired = require('../core/errors/guid-expired'),
      useRedis = require('../../redis').useClient,
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
  }, (findErr, user) => {
    if (findErr && findErr.name === 'CastError') {
      return reply.badRequest(findErr);
    } else if (findErr) {
      return reply.boom(findErr);
    } else if (!user) {
      return reply.boom(new RecordNotFound(User.modelName, request.params.id));
    }

    user.set(request.payload || {});
    return user.save(saveErr => {
      if (saveErr) {
        reply.boom(saveErr);
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
      reply.boom(new RecordNotFound(User.modelName, query));
    } else {
      reply(user.toObject());
    }
  });
}

function findByGuid(request, reply) {
  const guid = request.query.guid,
        key = 'user-' + guid;

  useRedis(client => {
    return client.getAsync(key);
  }, (err, userId) => {
    if (err) {
      reply.boom(err);
    } else if (!userId) {
      reply.boom(new GuidExpired(guid));
    } else {
      findOne(request, reply, { _id: userId });
    }
  });
}

function find(request, reply) {
  const query = request.query;
  const fields = (request.query.fields || '').split('~').join(' ');

  delete query.fields;
  User.find(query, fields, (err, users) => {
    if (err && err.name === 'CastError') {
      reply.badRequest(err);
    } else if (err) {
      reply.boom(err);
    } else {
      reply(users.map(user => user.toObject()));
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
    find(request, reply);
  }
}

function remove(request, reply) {
  User.remove({
    _id: request.params.id
  }, err => {
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
        key = 'user-' + guid;

  useRedis(client => {
    return client.multi()
      .set(key, userId)
      .expire(key, ttlInSeconds)
      .execAsync();
  }, err => {
    if (err) {
      reply.boom(err);
    } else {
      reply({
        status: 'link-created',
        userId: userId,
        guid: guid
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
