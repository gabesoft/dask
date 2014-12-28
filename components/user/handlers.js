'use strict';

var User = require('./user-model')
  , Boom = require('boom');

function create (request, reply) {
    var data = request.payload || {}
      , user = new User(data);

    user.save(function (err) {
        if (err && (err.name === 'ValidationError' || err.name === 'MongoError')) {
            reply(Boom.badRequest(err));
        } else if (err) {
            reply(Boom.badImplementation(err));
        } else {
            reply(user.toObject());
        }
    });
}

function update (request, reply) {
    var data = request.payload || {};

    User.findOne({ _id: request.params.id }, function (err, user) {
        if (err && err.name === 'CastError') {
            return reply(Boom.badRequest(err))
        } else if (err) {
            return reply(Boom.badImplementation(err));
        } else if (!user) {
            return reply(Boom.notFound('No user found with id ' + data.id));
        }

        user.set(data);
        user.save(function (err) {
            if (err) {
                reply(Boom.badImplementation(err));
            } else {
                reply(user.toObject());
            }
        });
    });
}

function read (request, reply) {
    User.findOne({ _id: request.params.id }, function (err, user) {
        if (err && err.name === 'CastError') {
            return reply(Boom.badRequest(err))
        } else if (err) {
            reply(Boom.badImplementation(err));
        } else if (!user) {
            reply(Boom.notFound('No user found with id ' + request.params.id));
        } else {
            reply(user.toObject());
        }
    });
}

function remove (request, reply) {
    User.remove({ _id: request.params.id }, function (err) {
        if (err && err.name === 'CastError') {
            return reply(Boom.badRequest(err))
        } else if (err) {
            reply(Boom.badImplementation(err));
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
};
