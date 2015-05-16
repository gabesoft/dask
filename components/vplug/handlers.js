'use strict';

var Vplug     = require('./vplug-model')
  , NotFound  = require('../core/errors/record-not-found')
  , DataQuery = require('../core/lib/data-query').DataQuery
  , url       = require('url');

function findOrCreate (opts, cb) {
    if (opts) {
        Vplug.findOne(opts, cb);
    } else {
        cb(null, new Vplug({}));
    }
}

function create (request, reply) {
    var data  = request.payload || {}
      , rurl  = request.url
      , isNew = false
      , opts  = {};

    if (data.githubUrl) {
        opts.githubUrl = data.githubUrl;
    } else if (opts.vimorgUrl) {
        opts.vimorgUrl = data.vimorgUrl;
    } else {
        opts = null;
    }

    findOrCreate(opts, function (err, plug) {
        if (err) {
            return reply.boom(err);
        }

        isNew = Boolean(plug.id);
        plug.set(data);
        plug.save(function (err) {
            if (err && err.code === 11000) {
                reply.conflict(err);
            } else if (err) {
                reply.boom(err);
            } else if (isNew) {
                rurl.pathname = [ rurl.pathname, plug.id ].join('/');
                reply.created(plug.toObject(), url.format(rurl));
            } else {
                reply(plug.toObject());
            }
        });
    });
}

function remove (request, reply) {
    Vplug.remove({ _id: request.params.id }, function (err) {
        return err ? reply.boom(err) : reply({ status: 'vplug-deleted', id: request.params.id });
    });
}

function search (request, reply) {
    var reqQuery  = request.query || {}
      , dataQuery = new DataQuery();

    dataQuery.parseSort(reqQuery.sort);
    dataQuery.addLimit(reqQuery.limit);
    dataQuery.addSkip(reqQuery.skip);
    dataQuery.andTextCriteria(reqQuery.search);

    dataQuery.getQuery(Vplug).exec(function (err, items) {
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
