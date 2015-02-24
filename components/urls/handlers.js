'use strict';

var UrlModel            = require('./url-model')
  , tagsModel           = require('../tags/model')
  , QueryModel          = require('./query-model')
  , RecordNotFoundError = require('../core/errors/record-not-found')
  , UrlQuery            = require('./url-query').Query
  , urlUtil             = require('url');

function create (request, reply) {
    var url  = new UrlModel(request.payload || {})
      , userId     = request.params.userId
      , redis      = request.server.app.redis
      , requestUrl = request.url;

    url.on('save', function (doc) {
        tagsModel.set(redis, userId, doc.get('tags'));
    });

    url.set({ userId: userId });
    url.save(function (err) {
        if (err && err.name === 'MongoError' && err.code === 11000) {
            reply.conflict(err);
        } else if (err && err.name === 'ValidationError') {
            reply.badRequest(err);
        } else if (err) {
            reply.boom(err);
        } else {
            requestUrl.pathname = [requestUrl.pathname, url.id].join('/');
            reply.created(url.toObject(), urlUtil.format(requestUrl));
        }
    });
}

function update (request, reply) {
    var userId = request.params.userId
      , redis  = request.server.app.redis
      , id     = request.params.id
      , query  = { _id: id, userId: userId };

    UrlModel.findOne(query, function (err, url) {
        if (err) {
            reply.boom(err);
        } else if (!url) {
            reply.boom(new RecordNotFoundError('url', query));
        } else {
            url.on('save', function (doc) {
                tagsModel.set(redis, userId, doc.get('tags'));
            });

            url.set(request.payload || {});
            url.set({ userId: userId });
            url.save(function (err) {
                return err ? reply.boom(err) : reply(url.toObject());
            });
        }
    });
}

function remove (request, reply) {
    var userId = request.params.userId;

    UrlModel.remove({ _id: request.params.id, userId: userId }, function (err) {
        return err ? reply.boom(err) : reply({ status: 'url-deleted', id: request.params.id });
    });
}

function read (request, reply) {
    var userId = request.params.userId
      , id     = request.params.id
      , query  = { _id: id, userId: userId };

    UrlModel.findOne(query, function (err, url) {
        if (err) {
            reply.boom(err);
        } else if (!url) {
            reply.boom(new RecordNotFoundError('url', query));
        } else {
            reply(url.toObject());
        }
    });
}

function saveQuery (query, urls, cb) {
    if (!query.toString() || urls.length === 0) { return cb(); }

    QueryModel.upsert({
        expression  : query.toString()
      , name        : query.toString()
      , resultCount : urls.length
      , userId      : query.criteria.userId
    }, cb);
}

function searchDb (query, cb) {
    UrlModel
       .find(query.criteria, query.fields)
       .sort(query.sort)
       .exec(function (err, urls) {
            if (err) { return cb(err); }

            saveQuery(query, urls, function () {
                cb(null, urls);
            });
        });
}

function readUserQueries (request, reply) {
    var reqQuery = request.query || {};
    // TODO: move sort & limit defaults to config
    //       and allow override
    //       consider storing queries in redis and cap to 100 records
    QueryModel
       .find({ userId: request.params.userId })
       .sort({ updatedAt: -1 })
       .limit(reqQuery.limit || 100)
       .exec(function (err, queries) {
            return err ? reply.boom(err) : reply(queries);
        });
}

function search (request, reply) {
    var userId   = request.params.userId
      , reqQuery = request.query || {}
      , urlQuery = new UrlQuery(reqQuery.search);

    urlQuery.criteria.userId = userId;
    urlQuery.addSort(reqQuery.sort);

    searchDb(urlQuery, function (err, urls) {
        if (err) {
            return reply.boom(err);
        } else {
            reply(urls.map(function (u) { return u.toObject(); }));
        }
    });
}

module.exports = {
    create  : create
  , update  : update
  , remove  : remove
  , read    : read
  , search  : search
  , queries : readUserQueries
};
