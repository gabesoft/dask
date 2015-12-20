'use strict';

const PostModel = require('../post-model'),
      RecordNotFound = require('../../core/errors/record-not-found'),
      responder = require('../../core/responder'),
      Promise = require('bluebird').Promise,
      DataQuery = require('../../core/lib/data-query').DataQuery,
      url = require('url'),
      searcher = require('../searcher');

function notFound(id) {
  return new RecordNotFound('Post', { id });
}

function updateUserPosts(request, reply) {
  const ids = request.params.ids.split('/'),
        posts = ids.map(id => Object.assign({ _id: id }, request.payload || {}));
  return searcher.update(posts).then(reply, e => reply.boom(e));
}

function searchPostsOld(request, reply) {
  const input = request.query || {},
        fields = (input.fields || '').split('~').filter(Boolean),
        query = new DataQuery();

  PostModel.schema.eachPath(path => {
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

  query
    .getQuery(PostModel)
    .exec()
    .then(docs => reply(docs.map(doc => doc.toObject())), e => reply.boom(e));
}

function bulkDeletePosts(request, reply) {

}

function bulkUpdatePosts(request, reply) {

}

function bulkReplacePosts(request, reply) {

}

function bulkCreatePosts(request, reply) {
  const items = request.payload || [],
        promises = items
          .map(item => (new PostModel(item)).save())
          .map(promise => Promise.resolve(promise).reflect());

  Promise
    .all(promises)
    .map(promise => promise.isFulfilled() ? promise.value() : promise.reason())
    .then(
      responder.bulkCreatedSuccess(request, reply),
      responder.bulkCreatedFailure(request, reply));
}

function searchPosts(request, reply) {

}

function deletePost(request, reply) {
  PostModel
    .findById(request.params.id)
    .then(doc => doc ? doc.remove() : null)
    .then(
      responder.deletedSuccess(request, reply),
      responder.deletedFailure(request, reply));
}

function updatePost(request, reply) {
  PostModel
    .findById(request.params.id)
    .then(doc => {
      if (doc) {
        doc.set(request.payload || {});
        return doc.save();
      }
    })
    .then(
      responder.updatedSuccess(request, reply),
      responder.updatedFailure(request, reply));
}

function replacePost(request, reply) {
  const query = { _id: request.params.id },
        data = request.payload || {},
        opts = { new: true, overwrite: true };

  PostModel
    .findOneAndUpdate(query, data, opts)
    .then(
      responder.replacedSuccess(request, reply),
      responder.replacedFailure(request, reply));
}

function createPost(request, reply) {
  new PostModel(request.payload || {})
    .save()
    .then(
      responder.createdSuccess(request, reply),
      responder.createdFailure(request, reply));
}

function readPost(request, reply) {
  PostModel
    .findById(request.params.id)
    .then(
      responder.readSuccess(request, reply),
      responder.readFailure(request, reply));
}

module.exports = {
  bulkCreatePosts,
  bulkDeletePosts,
  bulkReplacePosts,
  bulkUpdatePosts,
  createPost,
  deletePost,
  readPost,
  replacePost,
  searchPosts,
  updatePost
};
