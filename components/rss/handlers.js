'use strict';

const FeedModel = require('./feed-model'),
      PostModel = require('./post-model'),
      RecordNotFoundError = require('../core/errors/record-not-found'),
      DataQuery = require('../core/lib/data-query').DataQuery,
      url = require('url');

function create(request, reply, doc) {
  doc.save(err => {
    if (err && err.name === 'MongoError' && err.code === 11000) {
      reply.conflict(err);
    } else if (err && err.name === 'ValidationError') {
      reply.badRequest(err);
    } else if (err) {
      reply.boom(err);
    } else {
      request.url.pathname = [request.url.pathname, doc.id].join('/');
      reply.created(doc.toObject(), url.format(request.url));
    }
  });
}

function update(request, reply, Model, modelName) {
  const query = { _id: request.params.id };

  Model.findOne(query, (err, doc) => {
    if (err) {
      reply.boom(err);
    } else if (!doc) {
      reply.boom(new RecordNotFoundError(modelName, query));
    } else {
      doc.set(request.payload || {});
      doc.save(saveErr => {
        return saveErr ? reply.boom(err) : reply(doc.toObject());
      });
    }
  });
}

function remove(request, reply, Model, modelName, cb) {
  Model.remove({ _id: request.params.id }, err => {
    cb(err);

    if (err && err.name === 'CastError') {
      reply.badRequest(err);
    } else if (err) {
      reply.boom(err);
    } else {
      reply({
        status: `${modelName}-deleted`,
        id: request.params.id
      });
    }
  });
}

function read(request, reply, Model, modelName) {
  const query = { _id: request.params.id };

  Model.findOne(query, (err, doc) => {
    if (err && err.name === 'CastError') {
      reply.badRequest(err);
    } else if (err) {
      reply.boom(err);
    } else if (!doc) {
      reply.boom(new RecordNotFoundError(modelName, query));
    } else {
      reply(doc.toObject());
    }
  });
}

function search(request, reply, Model) {
  const input = request.query || {},
        query = new DataQuery();

  Model.schema.eachPath(path => {
    if (input[path]) {
      query.andCriteria(path, input[path]);
    }
  });

  query.parseSort(input.sort);
  query.addLimit(input.limit);
  query.addSkip(input.skip);

  if (query.error) {
    return reply.boom(query.error);
  }

  query.getQuery(Model).exec((err, docs) => {
    if (err) {
      reply.boom(err);
    } else {
      reply(docs.map(doc => doc.toObject()));
    }
  });
}

function createFeed(request, reply) {
  create(request, reply, new FeedModel(request.payload || {}));
}

function createPost(request, reply) {
  create(request, reply, new PostModel(request.payload || {}));
}

function readFeed(request, reply) {
  read(request, reply, FeedModel, 'feed');
}

function readPost(request, reply) {
  read(request, reply, PostModel, 'post');
}

function removeFeed(request, reply) {
  remove(request, reply, FeedModel, 'feed', (err) => {
    if (!err) {
      PostModel.remove({ feedId: request.params.id }, () => {});
    }
  });
}

function removePost(request, reply) {
  remove(request, reply, PostModel, 'post', () => {});
}

function searchFeeds(request, reply) {
  search(request, reply, FeedModel);
}

function searchPosts(request, reply) {
  search(request, reply, PostModel);
}

function updateFeed(request, reply) {
  update(request, reply, FeedModel, 'feed');
}

function updatePost(request, reply) {
  update(request, reply, PostModel, 'post');
}

module.exports = {
  createFeed: createFeed,
  createPost: createPost,
  readFeed: readFeed,
  readPost: readPost,
  removeFeed: removeFeed,
  removePost: removePost,
  searchFeeds: searchFeeds,
  searchPosts: searchPosts,
  updateFeed: updateFeed,
  updatePost: updatePost
};

