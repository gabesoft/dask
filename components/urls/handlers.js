'use strict';

const UrlModel = require('./url-model'),
      tagsHelper = require('../tags/helper'),
      QueryModel = require('./query-model'),
      RecordNotFoundError = require('../core/errors/record-not-found'),
      UrlQuery = require('./url-query').Query,
      urlUtil = require('url');

function create(request, reply) {
  const url = new UrlModel(request.payload || {}),
        userId = request.params.userId,
        requestUrl = request.url;

  url.on('save', (doc) => {
    tagsHelper.set(userId, doc.get('tags'));
  });

  url.set({
    userId: userId
  });
  url.save((err) => {
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

function update(request, reply) {
  const userId = request.params.userId,
        id = request.params.id,
        query = {
          _id: id,
          userId: userId
        };

  UrlModel.findOne(query, (err, url) => {
    if (err) {
      reply.boom(err);
    } else if (!url) {
      reply.boom(new RecordNotFoundError('url', query));
    } else {
      url.on('save', (doc) => {
        tagsHelper.set(userId, doc.get('tags'));
      });

      url.set(request.payload || {});
      url.set({
        userId: userId
      });
      url.save((saveErr) => {
        return saveErr ? reply.boom(err) : reply(url.toObject());
      });
    }
  });
}

function remove(request, reply) {
  const userId = request.params.userId;

  UrlModel.remove({
    _id: request.params.id,
    userId: userId
  }, err => {
    return err ? reply.boom(err) : reply({
      status: 'url-deleted',
      id: request.params.id
    });
  });
}

function read(request, reply) {
  const userId = request.params.userId,
        id = request.params.id,
        query = {
          _id: id,
          userId: userId
        };

  UrlModel.findOne(query, function(err, url) {
    if (err) {
      reply.boom(err);
    } else if (!url) {
      reply.boom(new RecordNotFoundError('url', query));
    } else {
      reply(url.toObject());
    }
  });
}

function saveQuery(query, urls, cb) {
  if (!query.toString()) {
    return cb();
  }

  const data = {
    expression: query.toString(),
    resultCount: urls.length,
    userId: query.criteria.userId
  };

  if (urls.length === 0) {
    QueryModel.delete(data, cb);
  } else {
    QueryModel.upsert(data, cb);
  }
}

function searchDb(query, cb) {
  query.getQuery(UrlModel).exec((err, urls) => {
    if (err) {
      return cb(err);
    }

    saveQuery(query, urls, () => {
      cb(null, urls);
    });
  });
}

function readUserQueries(request, reply) {
  const reqQuery = request.query || {};
  QueryModel
    .find({
      userId: request.params.userId
    })
    .sort({
      updatedAt: -1
    })
    .limit(reqQuery.limit || 100)
    .exec((err, queries) => {
      return err ? reply.boom(err) : reply(queries);
    });
}

function search(request, reply) {
  const userId = request.params.userId,
        reqQuery = request.query || {},
        urlQuery = new UrlQuery();

  urlQuery.parse(reqQuery.search);
  urlQuery.criteria.userId = userId;
  urlQuery.parseSort(reqQuery.sort);
  urlQuery.addLimit(reqQuery.limit);
  urlQuery.addSkip(reqQuery.skip);

  if (urlQuery.error) {
    return reply.boom(urlQuery.error);
  }

  return searchDb(urlQuery, (err, urls) => {
    if (err) {
      return reply.boom(err);
    }

    return reply(urls.map((url) => {
      return url.toObject();
    }));
  });
}

module.exports = {
  create: create,
  update: update,
  remove: remove,
  read: read,
  search: search,
  queries: readUserQueries
};
