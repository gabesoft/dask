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
  handlers[method](request, reply).then(() => done(), done);
}

describe('user post handlers bulk @mongo @elastic', () => {
  describe('create', () => {
    it('returns the created posts', done => {
      const feed = factory.makeFeedAndSave(),
            posts = factory.makePostsAndSave(3, { feedId: feed.get('id') }),
            sub = factory.makeSubscriptionAndSave({ feedId: feed.get('id') }),
            request = makeRequest({ data: { read: true } }, { subscriptionId: sub.get('id') }),
            reply = data => {
              const ids = data.map(post => post._source.postId),
                    read = data.map(post => post._source.read);

              expect(ids).to.have.same.members(posts.map(post => post.get('id')));
              expect(read).to.eql([true, true, true]);
            };
      run(request, reply, 'bulkCreatePosts', done);
    });

    it('returns the created posts when array ids are specified', done => {
      const feed = factory.makeFeedAndSave(),
            posts = factory.makePostsAndSave(5, { feedId: feed.get('id') }),
            sub = factory.makeSubscriptionAndSave({ feedId: feed.get('id') }),
            payload = { postIds: posts.slice(0, 3).map(post => post.get('id')) },
            request = makeRequest(payload, { subscriptionId: sub.get('id') }),
            reply = data => {
              const ids = data.map(post => post._source.postId);
              expect(ids).to.have.same.members(payload.postIds);
            };
      run(request, reply, 'bulkCreatePosts', done);
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
        run(request, reply, 'bulkDeletePosts', done);
      });
    });
  });
});
