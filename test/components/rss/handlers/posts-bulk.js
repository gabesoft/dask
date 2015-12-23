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
      const posts = factory.makePosts(3),
            saved = factory.makePostsAndSave(2),
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

  describe('replace', () => {

  });

  describe('update', () => {

  });

  describe('delete', () => {

  });
});
