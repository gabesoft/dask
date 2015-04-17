'use strict';

var Vplug    = require('./vplug-model')
  , NotFound = require('../core/errors/record-not-found')
  , url      = require('url');

function create (request, reply) {
    var plug = new Vplug(request.payload || {})
      , rurl = request.url;

    plug.save(function (err) {
        if (err && err.code === 11000) {
            reply.conflict(err);
        } else if (err) {
            reply.boom(err);
        } else {
            rurl.pathname = [ rurl.pathname, plug.id ].join('/');
            reply.created(plug.toObject(), url.format(rurl));
        }
    });
}

function remove (request, reply) {
    Vplug.remove({ _id: request.params.id }, function (err) {
        return err ? reply.boom(err) : reply({ status: 'vplug-deleted', id: request.params.id });
    });
}

function search (request, reply) {
    Vplug.find({}).sort({githubStarCount : -1}).exec(function (err, items) {
        return err ? reply.boom(err) : reply(items);
    });
}

function update (request, reply) {
    var query = { _id: request.params.id };

    Vplug.findOne(query, function (err, plug) {
        if (err) {
            reply.boom(err);
        } else if (!plug) {
            reply.boom(new NotFound('vplug', query));
        } else {
            plug.set(request.payload || {});
            plug.save(function (err) {
                return err ? reply.boom(err) : reply(plug.toObject());
            });
        }
    });
}

module.exports = {
    create : create
  , update : update
  , remove : remove
  , search : search
};
