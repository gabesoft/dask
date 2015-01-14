'use strict';

var Profile = require('./profile-model');

function find (request, reply, query) {
    Profile.find(query, function (err, profiles) {
        if (err && err.name === 'CastError') {
            reply.badRequest(err);
        } else if (err) {
            reply.boom(err);
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
      , isNew  = false
      , userId = request.params.id;

    Profile.findOne({ userId: userId }, function (err, profile) {
        if (err) {
            return reply.badRequest(err);
        }
        if (!profile) {
            isNew   = true;
            profile = new Profile();
        }

        profile.set(data);
        profile.set({ userId: userId });
        profile.save(function (err) {
            if (err && err.name === 'MongoError' && err.code === 11000) {
                reply.conflict(err);
            } else if (err) {
                reply.boom(err);
            } else if (isNew) {
                reply.created(profile.toObject(), '/profiles/' + profile.id);
            } else {
                reply(profile.toObject());
            }
        });
    });
}

function read (request, reply) {
    Profile.findOne({ _id: request.params.id }, function (err, profile) {
        if (err) {
            return reply.internal(err);
        } else if (!profile) {
            return reply.notFound('No profile found with id ' + request.params.id);
        } else {
            return reply(profile.toObject());
        }
    });
}

function readByUser (request, reply) {
    var userId = request.params.id;

    Profile.findOne({ userId : userId }, function (err, profile) {
        if (err) {
            return reply.badRequest(err);
        }
        if (!profile) {
            profile = new Profile();
            profile.set({ userId: userId });
            profile.save(function (err) {
                if (err) {
                    reply.boom(err);
                } else {
                    reply.created(profile.toObject(), '/profiles/' + profile.id);
                }
            });
        } else {
            reply(profile.toObject());
        }
    });
}

module.exports = {
    save       : save
  , read       : read
  , readByUser : readByUser
  , search     : search
};
