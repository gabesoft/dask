'use strict';

var Profile = require('./profile-model');

function find (request, reply, query) {
    Profile.find(query, function (err, profiles) {
        if (err && err.name === 'CastError') {
            reply.failBadRequest(err);
        } else if (err) {
            reply.fail(err);
        } else {
            reply(profiles.map(function (p) { return p.toObject(); }));
        }
    });
}

function search (request, reply) {
    find(request, reply, request.query);
}

function save (request, reply) {
    var data   = request.payload || {}
      , userId = request.params.id;

    Profile.findOne({ userId: userId }, function (err, profile) {
        if (err) {
            return reply.failBadRequest(err);
        }
        if (!profile) {
            profile = new Profile();
        }

        profile.set(data);
        profile.set({ userId: userId });
        profile.save(function (err) {
            if (err && err.name === 'MongoError' && err.code === 11000) {
                reply.failConflict(err);
            } else if (err) {
                reply.fail(err);
            } else {
                reply(profile.toObject());
            }
        });
    });
}

function read (request, reply) {
    var userId = request.params.id;

    Profile.findOne({ userId : userId }, function (err, profile) {
        if (err) {
            return reply.failBadRequest(err);
        }
        if (!profile) {
            profile = new Profile();
            profile.set({ userId: userId });
            profile.save(function (err) {
                if (err) {
                    reply.fail(err);
                } else {
                    reply(profile.toObject());
                }
            });
        } else {
            reply(profile.toObject());
        }
    });
}

module.exports = {
    save   : save
  , read   : read
  , search : search
};
