'use strict';

var User = require('./user-model')
  , url  = require('url');

function create (request, reply) {
    var data = request.payload || {}
      , user = new User(data)
      , uri  = request.url;

    user.save(function (err) {
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

function update (request, reply) {
    var data = request.payload || {};

    User.findOne({ _id: request.params.id }, function (err, user) {
        if (err && err.name === 'CastError') {
            return reply.badRequest(err);
        } else if (err) {
            return reply.boom(err);
        } else if (!user) {
            return reply.notFound('No user found with id ' + data.id);
        }

        user.set(data);
        user.save(function (err) {
            if (err) {
                reply.boom(err);
            } else {
                reply(user.toObject());
            }
        });
    });
}

function findOne (request, reply, query) {
    User.findOne(query, function (err, user) {
        if (err && err.name === 'CastError') {
            reply.badRequest(err);
        } else if (err) {
            reply.boom(err);
        } else if (!user) {
            reply.notFound('No user found with query ' + JSON.stringify(query));
        } else {
            reply(user.toObject());
        }
    });
}

function find (request, reply, query) {
    User.find(query, function (err, users) {
        if (err && err.name === 'CastError') {
            reply.badRequest(err);
        } else if (err) {
            reply.boom(err);
        } else {
            reply(users.map(function (u) { return u.toObject(); }));
        }
    });
}

function read (request, reply) {
    findOne(request, reply, { _id: request.params.id });
}

function search (request, reply) {
    find(request, reply, request.query);
}

function remove (request, reply) {
    User.remove({ _id: request.params.id }, function (err) {
        if (err && err.name === 'CastError') {
            reply.badRequest(err);
        } else if (err) {
            reply.boom(err);
        } else {
            reply({ status: 'deleted', id: request.params.id });
        }
    });
}

module.exports = {
    create : create
  , read   : read
  , update : update
  , remove : remove
  , search : search
};
