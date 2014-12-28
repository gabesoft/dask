var User = require('./user-model')
  , Boom = require('boom');

function create (request, reply) {
    var data = request.payload || {}
      , user = User.create(data);

    user.save(function (err) {
        if (err) {
            reply(Boom.badImplementation(err.message));
        } else {
            reply(user.toObject());
        }
    });
}

function update (request, reply) {
    var data = request.payload || {};

    User.findOne({ id: data.id }, function (err, user) {
        if (err) {
            return reply(Boom.badImplementation(err.message));
        }
        if (!user) {
            return reply(Boom.badRequest('No user matches the specified id', data));
        }

        user.set(data);
        user.save(function (err) {
            if (err) {
                reply(Boom.badImplementation(err.message));
            } else {
                reply(user.toObject());
            }
        });
    });
}

function read (request, reply) {
    User.findOne({ id: request.params.id }, function (err, user) {
        if (err) {
            reply(Boom.badImplementation(err.message));
        } else {
            reply(user.toObject());
        }
    });
}

function delete (request, reply) {
    User.remove({ id: request.params.id }, function (err) {
        if (err) {
            reply(Boom.badImplementation(err.message));
        } else {
            reply({ status: 'deleted', id: request.params.id });
        }
    });
}

module.exports = {
    create : create
  , read   : read
  , update : update
  , delete : delete
};
