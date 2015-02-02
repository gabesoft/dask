'use strict';

var UrlModel            = require('./url-model')
  , RecordNotFoundError = require('../core/errors/record-not-found')
  , urlUtil             = require('url');

function create (request, reply) {
    var urlObject  = new UrlModel(request.payload || {})
      , userId     = request.params.userId
      , requestUrl = request.url;

    urlObject.set({ userId: userId })
    urlObject.save(function (err) {
        if (err && err.name === 'MongoError' && err.code === 11000) {
            reply.conflict(err);
        } else if (err && err.name === 'ValidationError') {
            reply.badRequest(err);
        } else if (err) {
            reply.boom(err);
        } else {
            requestUrl.pathname = [requestUrl.pathname, urlObject.id].join('/');
            reply.created(urlObject.toObject(), urlUtil.format(requestUrl));
        }
    });
}

function update (request, reply) {
    var userId = request.params.userId;

    Url.findOne({_id: request.params.id}, function (err, url) {
        if (err) {
            reply.boom(err);
        } else if (!url) {
            reply.boom(new RecordNotFoundError('url', request.params.id));
        } else {
            url.set(request.payload || {});
            url.set({ userId: userId })
            url.save(function (err) {
                return err ? reply.boom(err) : reply(url.toObject());
            });
        }
    });
}

function remove (request, reply) {
    var userId = request.params.userId;

    Url.remove({ _id: request.params.id, userId: userId }, function (err) {
        return err ? reply.boom(err) : reply({ status: 'url-deleted', id: request.params.id });
    });
}

module.exports = {
    create : create
  , update : update
  , remove : remove
};
