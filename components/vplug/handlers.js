'use strict';

var Vplug     = require('./vplug-model')
  , NotFound  = require('../core/errors/record-not-found')
  , DataQuery = require('../core/data-query').DataQuery
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

    if (data.githubHtmlUrl) {
        opts.githubHtmlUrl = data.githubHtmlUrl;
    } else if (opts.vimorgUrl) {
        opts.vimorgUrl = data.vimorgUrl;
    } else {
        opts = null;
    }

    findOrCreate(opts, function (err, plug) {
        if (err) {
            return reply.boom(err);
        }

        if (!plug) {
            isNew = true;
            plug  = new Vplug();
        }

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
      , fields    = (reqQuery.fields || '').split('~').filter(Boolean)
      , dataQuery = new DataQuery();

    // TODO: add total count
    dataQuery.parseSort(reqQuery.sort);
    dataQuery.addLimit(reqQuery.limit);
    dataQuery.addSkip(reqQuery.skip);
    dataQuery.andTextCriteria(reqQuery.search);

    fields.forEach(function (field) {
        dataQuery.addField(field, 1);
    });

    if (reqQuery.isPlugin) {
        dataQuery.andCriteria('isPlugin', reqQuery.isPlugin, 'gt');
    }

    dataQuery.getQuery(Vplug).exec(function (err, items) {
        return err ? reply.boom(err) : reply(items.map(function (item) {
            return item.toObject();
        }));
    });
}

function read (request, reply) {
    var id     = request.params.id
      , query  = { _id: id };

    Vplug.findOne(query, function (err, plug) {
        if (err) {
            reply.boom(err);
        } else if (!plug) {
            reply.boom(new NotFound('plug', query));
        } else {
            reply(plug.toObject());
        }
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
  , read   : read
};
