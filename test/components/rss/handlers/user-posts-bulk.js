'use strict';

const handlers = require('../../../../components/rss/handlers/user-posts'),
      expect = require('chai').expect,
      factory = require('../../../support/factories/rss'),
      PATH = '/posts';

function makeRequest(payload, params, query, pathname) {
  pathname = pathname || PATH;
  return { payload, params, query, url: { pathname } };
}

function run(request, reply, method, done) {
  expect(handlers).to.contain.keys([method]);
  handlers[method](request, reply).then(() => done(), done);
}

describe('user post handlers bulk @mongo @elastic', () => {
  describe('create', () => {
    it('returns the created posts', done => {
      factory.makeSubscriptionAndPostsAndSave(3).then(results => {
        const subscriptionId = results.subscription.get('id'),
              postIds = results.posts.map(post => post.get('id')),
              request = makeRequest({ data: { read: true } }, { subscriptionId }),
              reply = data => {
                const ids = data.map(post => post._source.postId),
                      read = data.map(post => post._source.read);
                expect(ids).to.have.same.members(postIds);
                expect(read).to.eql([true, true, true]);
              };
        run(request, reply, 'bulkCreatePosts', done);
      }, done);
    });

    it('returns the created posts when array ids are specified', done => {
      factory.makeSubscriptionAndPostsAndSave(5).then(results => {
        const postIds = results.posts.map(post => post.get('id')),
              subscriptionId = results.subscription.get('id'),
              payload = { postIds: postIds.slice(0, 3) },
              request = makeRequest(payload, { subscriptionId }),
              reply = data => {
                const ids = data.map(post => post._source.postId);
                expect(ids).to.have.same.members(payload.postIds);
              };
        run(request, reply, 'bulkCreatePosts', done);
      });
    });
  });

  describe('delete', () => {
    it('returns the deleted posts', done => {
      factory.makeUserPostsAndSave(5).then(results => {
        const subscriptionId = results[0]._source.subscriptionId,
              request = makeRequest(null, { subscriptionId }),
              reply = data => {
                const ids = data.map(post => post._id);
                expect(ids).to.have.same.members(results.map(post => post._id));
              };
        run(request, reply, 'bulkRemovePosts', done);
      }, done);
    });
  });
});
