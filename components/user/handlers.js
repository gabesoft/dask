'use strict';

var User = require('./user-model');

function create (request, reply) {
    var data = request.payload || {}
      , user = new User(data);

    user.save(function (err) {
        if (err && err.name === 'MongoError' && err.code === 11000) {
            reply.failConflict(err);
        } else if (err && err.name === 'ValidationError') {
            reply.failBadRequest(err);
        } else if (err) {
            reply.fail(err);
        } else {
            reply(user.toObject());
        }
    });
}

function update (request, reply) {
    var data = request.payload || {};

    User.findOne({ _id: request.params.id }, function (err, user) {
        if (err && err.name === 'CastError') {
            return reply.failBadRequest(err);
        } else if (err) {
            return reply.fail(err);
        } else if (!user) {
            return reply.failNotFound('No user found with id ' + data.id);
        }

        user.set(data);
        user.save(function (err) {
            if (err) {
                reply.fail(err);
            } else {
                reply(user.toObject());
            }
        });
    });
}

function find (request, reply, query) {
    User.find(query, function (err, users) {
        if (err && err.name === 'CastError') {
            reply.failBadRequest(err);
        } else if (err) {
            reply.fail(err);
        } else if (!users) {
            reply.failNotFound('No user found with query ' + JSON.stringify(query));
        } else {
            reply(users.map(function (u) { return u.toObject(); }));
        }
    });
}

function read (request, reply) {
    find(request, reply, { _id: request.params.id });
}

function search (request, reply) {
    find(request, reply, request.query);
}

function remove (request, reply) {
    User.remove({ _id: request.params.id }, function (err) {
        if (err && err.name === 'CastError') {
            reply.failBadRequest(err);
        } else if (err) {
            reply.fail(err);
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
