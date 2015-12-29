'use strict';

const handlers = require('../../../../components/rss/handlers/posts'),
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

describe('post handlers bulk @mongo', () => {
  describe('create', () => {
    it('returns the created posts in the correct order', done => {
      const posts = factory.makePosts(3),
            payload = posts.map(post => post.toObject()),
            request = makeRequest(payload),
            reply = data => {
              const expected = posts.map(post => post.get('guid')),
                    actual = data.map(post => post.guid);
              expect(actual).to.eql(expected);
            };
      run(request, reply, 'bulkCreatePosts', done);
    });

    it('returns an empty array if an empty array is specified', done => {
      const request = makeRequest([]),
            reply = data => expect(data).to.eql([]);
      run(request, reply, 'bulkCreatePosts', done);
    });

    it('returns errors for operations that failed', done => {
      factory.makePostsAndSave(2).then(saved => {
        const posts = factory.makePosts(3),
              payload = posts.concat(saved).map(post => post.toObject()),
              request = makeRequest(payload),
              reply = data => {
                const actual = data.map(post => Boolean(post.isError));
                expect(actual).to.eql([true, false, true, true, true]);
              };

        delete payload[0].guid;
        delete payload[2].feedId;

        run(request, reply, 'bulkCreatePosts', done);
      });
    });
  });

  describe('replace', () => {
    it('returns the replaced posts', done => {
      factory.makePostsAndSave(3).then(existing => {
        const newPosts = factory.makePosts(3),
              payload = existing.map((post, index) => {
                const data = newPosts[index].toObject();
                return Object.assign(data, { id: post.get('id') });
              }),
              request = makeRequest(payload),
              reply = data => expect(data).to.eql(payload);
        run(request, reply, 'bulkReplacePosts', done);
      });
    });
  });

  describe('update', () => {
    it('returns the updated posts', done => {
      factory.makePostsAndSave(3).then(existing => {
        const newPosts = factory.makePosts(3),
              payload = existing.map((post, index) => {
                const data = newPosts[index].toObject();
                return Object.assign(data, { id: post.get('id') });
              }),
              request = makeRequest(payload),
              reply = data => expect(data).to.eql(payload);
        run(request, reply, 'bulkUpdatePosts', done);
      });
    });
  });

  describe('delete', () => {
    it('returns the deleted posts', done => {
      factory.makePostsAndSave(3).then(posts => {
        const postsData = posts.map(post => post.toObject()),
              payload = posts.map(post => post.get('id')),
              request = makeRequest(payload),
              reply = data => expect(data).to.eql(postsData);
        run(request, reply, 'bulkRemovePosts', done);
      }, done);
    });

    it('returns error for not found posts', done => {
      factory.makePostsAndSave(3).then(posts => {
        const temp = factory.makePosts(2),
              payload = posts
                .map(post => post.get('id'))
                .concat(temp.map(post => post.get('id'))),
              request = makeRequest(payload),
              reply = data => {
                const actual = data.map(post => Boolean(post.isError));
                expect(actual).to.eql([false, false, false, true, true]);
              };
        run(request, reply, 'bulkRemovePosts', done);
      });
    });
  });
});
