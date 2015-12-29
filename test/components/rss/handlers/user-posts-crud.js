'use strict';

const handlers = require('../../../../components/rss/handlers/user-posts'),
      expect = require('chai').expect,
      factory = require('../../../support/factories/rss'),
      PATH = '/user-posts';

function makeRequest(payload, params, query, pathname) {
  pathname = pathname || PATH;
  return { payload, params, query, url: { pathname } };
}

function run(request, reply, method, done) {
  handlers[method](request, reply).then(() => done(), done);
}

describe('user post handlers crud @mongo @elastic', () => {
  describe('create', () => {
    it('returns the new user post', done => {
      factory.makeSubscriptionAndPostsAndSave(1)
        .then(results => {
          const postId = results.posts[0].get('id'),
                subscriptionId = results.subscription.get('id');
          const request = makeRequest(null, { subscriptionId, postId });
          const reply = data => {
            expect(data._source.subscriptionId).to.equal(subscriptionId);
            return { created: (url) => expect(url).to.equal(`${PATH}/${data._id}`) };
          };
          run(request, reply, 'createPost', done);
        }, done);
    });
  });

  describe('update', () => {
    it('returns the updated post', done => {
      factory.makeUserPostAndSave().then(post => {
        const payload = { tags: ['test1', 'test2'], post: { title: 'updated' } },
              request = makeRequest(payload, {
                subscriptionId: post._source.subscriptionId,
                postId: post._source.postId
              }),
              reply = data => {
                expect(data._id).to.equal(post._id);
                expect(data._source.tags).to.eql(payload.tags);
                expect(data._source.post.title).to.eql(payload.post.title);
              };

        run(request, reply, 'updatePost', done);
      }, done);
    });
  });

  describe('read', () => {
    it('returns the user post that matches an id', done => {
      factory.makeUserPostAndSave().then(post => {
        const params = { id: post._id },
              request = makeRequest(null, params),
              reply = data => {
                expect(data._id).to.equal(post._id);
                expect(data._source.post.guid).to.equal(post._source.post.guid);
              };
        run(request, reply, 'readPost', done);
      }, done);
    });
  });

  describe('delete', () => {
    it('returns the id of the removed post', done => {
      factory.makeUserPostAndSave().then(post => {
        const params = { id: post._id },
              request = makeRequest(null, params),
              reply = data => expect(data._id).to.equal(post._id);
        run(request, reply, 'removePost', done);
      });
    });
  });
});
