'use strict';

const FeedModel = require('./feed-model'),
      trans = require('trans'),
      FeedSubModel = require('./feed-subscription-model'),
      PostModel = require('./post-model'),
      RecordNotFound = require('../core/errors/record-not-found'),
      DataQuery = require('../core/lib/data-query').DataQuery,
      ReadStatus = require('./posts-read-status'),
      url = require('url');

function returnFindResults(reply, query, modelName) {
  return (err, doc) => {
    if (err && err.name === 'CastError') {
      reply.badRequest(err);
    } else if (err) {
      reply.boom(err);
    } else if (!doc) {
      reply.boom(new RecordNotFound(modelName, query));
    } else {
      if (Array.isArray(doc)) {
        reply(doc.map(x => x.toObject()));
      } else {
        reply(doc.toObject());
      }
    }
  };
}

function queryFeedPosts(feedIds, cb) {
  const query = new DataQuery();
  query.addField('feedId', 1);
  query.andCriteria('feedId', feedIds, 'in');
  query.getQuery(PostModel).exec(cb);
}

function create(request, reply, doc, cb) {
  doc.save(err => {
    cb = cb || (() => {});
    cb(err);

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

function update(request, reply, Model) {
  const modelName = Model.modelName,
        query = { _id: request.params.id };

  Model.findOne(query, (err, doc) => {
    if (err) {
      reply.boom(err);
    } else if (!doc) {
      reply.boom(new RecordNotFound(modelName, query));
    } else {
      const data = request.payload || {};
      data.tags = data.tags || [];
      doc.set(data);
      doc.save(e => e ? reply.boom(e) : reply(doc.toObject()));
    }
  });
}

function remove(request, reply, Model, cb) {
  const modelName = Model.modelName;
  Model.remove({ _id: request.params.id }, err => {
    cb = cb || (() => {});
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

function read(request, reply, Model) {
  const modelName = Model.modelName,
        query = { _id: request.params.id },
        next = returnFindResults(reply, query, modelName);

  Model.findOne(query, next);
}


function search(request, reply, Model) {
  const input = request.query || {},
        fields = (request.query.fields || '').split('~').filter(Boolean),
        query = new DataQuery();

  Model.schema.eachPath(path => {
    if (input[path]) {
      query.andCriteria(path, input[path]);
    }
  });

  query.parseSort(input.sort || 'date:desc');
  query.addLimit(input.limit);
  query.addSkip(input.skip);

  fields.forEach(field => query.addField(field, 1));

  if (query.error) {
    return reply.boom(query.error);
  }

  return query.getQuery(Model).exec((err, docs) => {
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
  read(request, reply, FeedModel);
}

function readPost(request, reply) {
  read(request, reply, PostModel);
}

function removeFeed(request, reply) {
  remove(request, reply, FeedModel, (err) => {
    if (err) {
      return reply.boom(err);
    }

    PostModel.remove({ feedId: request.params.id }, () => {});
    FeedSubModel.remove({ feedId: request.params.id }, () => {});
  });
}

function removePost(request, reply) {
  remove(request, reply, PostModel);
}

function searchFeeds(request, reply) {
  search(request, reply, FeedModel);
}

function searchPosts(request, reply) {
  search(request, reply, PostModel);
}

function updateFeed(request, reply) {
  update(request, reply, FeedModel);
}

function updatePost(request, reply) {
  update(request, reply, PostModel);
}

function updateSubscription(request, reply) {
  update(request, reply, FeedSubModel);
}

function unreadCountsPerFeed(redis, userId, subscriptions, cb) {
  const feedIds = subscriptions.map(sub => sub.feedId);
  queryFeedPosts(feedIds, (err, posts) => {
    if (err) {
      return cb(err);
    }

    const status = new ReadStatus(redis);

    status.readIds(userId, (err, data) => {
      if (err) {
        return cb(err);
      }

      const readPosts = new Set(data);
      const postsByFeed = trans(posts)
              .map('.', 'toObject')
              .group('feedId:feedId:count', 'id')
              .mapf('count', [ 'filter', id => !readPosts.has(id) ], 'length')
              .value();

      cb(null, postsByFeed);
    });
  });
}

function findSubscriptions(request, reply, single) {
  const query = {};

  if (request.query.userId) {
    query.userId = request.query.userId;
  }

  if (request.params.userId) {
    query.userId = request.params.userId;
  }

  if (request.query.feedId) {
    query.feedId = request.query.feedId;
  }

  if (request.params.feedId) {
    query.feedId = request.params.feedId;
  }

  FeedSubModel[single ? 'findOne' : 'find'](query, (err, subscriptions) => {
    if (err) {
      return reply.boom(err);
    }
    if (single && !subscriptions) {
      return reply.boom(new RecordNotFound('FeedSubscription', query));
    }
    if (single) {
      subscriptions = [subscriptions];
    }

    unreadCountsPerFeed(
      request.server.app.redis,
      query.userId,
      subscriptions,
      (err, countsByFeed) => {
        if (err) {
          return reply.boom(err);
        }

        const counts = trans(countsByFeed).object('feedId', 'count').value();
        subscriptions = trans(subscriptions)
          .map('.', 'toObject')
          .mapff('feedId', 'unreadCount', counts)
          .value();

        reply(single ? subscriptions[0] : subscriptions);
      }
    );
  });
}

function getUnreadCounts(request, reply) {
  FeedSubModel.find({ userId: request.params.id }, (err, subscriptions) => {
    if (err) {
      return reply.boom(err);
    }

    unreadCountsPerFeed(
      request.server.app.redis,
      request.params.id,
      subscriptions,
      (err, postsByFeed) => err ? reply.boom(err) : reply(postsByFeed));
  });
}

function feedSubscriptions(request, reply) {
  findSubscriptions(request, reply, false);
}

function feedSubscription(request, reply) {
  findSubscriptions(request, reply, true);
}

function createSubscription(request, reply) {
  const doc = new FeedSubModel(request.payload || {});
  create(request, reply, doc, () => {
    queryFeedPosts([doc.feedId], (err, posts) => {
      const status = new ReadStatus(request.server.app.redis);
      const ids = trans(posts).map('.', 'toObject').pluck('id').value();
      status.markAsRead(doc.userId, ids);
    });
  });
}

function removeSubscription(request, reply) {
  remove(request, reply, FeedSubModel);
}

function markPostsAsRead(request, reply) {
  const userId = request.params.id,
        postIds = request.payload.postIds || [],
        status = new ReadStatus(request.server.app.redis);

  status.markAsRead(userId, postIds, (err, data) => {
    return err ? reply.boom(err) : reply(data);
  });
}

function markPostsAsUnread(request, reply) {
  const userId = request.params.id,
        postIds = request.payload.postIds || [],
        status = new ReadStatus(request.server.app.redis);

  status.markAsUnread(userId, postIds, (err, data) => {
    return err ? reply.boom(err) : reply(data);
  });
}

function getReadState(request, reply) {
  const userId = request.params.id,
        postIds = request.payload.postIds || [],
        status = new ReadStatus(request.server.app.redis);

  status.readState(userId, postIds, (err, data) => {
    return err ? reply.boom(err) : reply(data);
  });
}

module.exports = {
  createFeed: createFeed,
  createPost: createPost,
  createSubscription: createSubscription,
  feedSubscription: feedSubscription,
  feedSubscriptions: feedSubscriptions,
  readFeed: readFeed,
  readPost: readPost,
  removeFeed: removeFeed,
  removePost: removePost,
  removeSubscription: removeSubscription,
  searchFeeds: searchFeeds,
  searchPosts: searchPosts,
  updateFeed: updateFeed,
  updatePost: updatePost,
  updateSubscription: updateSubscription,
  markPostsAsUnread: markPostsAsUnread,
  getReadState: getReadState,
  markPostsAsRead: markPostsAsRead,
  getUnreadCounts: getUnreadCounts
};
