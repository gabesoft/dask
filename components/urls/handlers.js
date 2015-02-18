'use strict';

var UrlModel            = require('./url-model')
  , RecordNotFoundError = require('../core/errors/record-not-found')
  , UrlQuery            = require('./url-query').Query
  , urlUtil             = require('url');

function saveTags (redis, url) {
    var tags = url.get('tags') || [];
    if (tags.length > 0) {
        redis.sadd('tags', tags, function (err, data) {
            if (err) {
                console.log('failed to save tags', tags, err);
            }
        });
    }
}

function create (request, reply) {
    var url  = new UrlModel(request.payload || {})
      , userId     = request.params.userId
      , redis      = request.server.app.redis
      , requestUrl = request.url;

    url.on('save', function (doc) {
        saveTags(redis, doc);
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
                saveTags(redis, doc);
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

function searchDb (query, cb) {
    UrlModel
       .find(query.criteria, query.fields)
       .sort(query.sort)
       .exec(cb);
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
    create : create
  , update : update
  , remove : remove
  , read   : read
  , search : search
};
