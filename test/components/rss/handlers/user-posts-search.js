'use strict';

const handlers = require('../../../../components/rss/handlers/user-posts'),
      expect = require('chai').expect,
      factory = require('../../../support/factories/rss');

describe('user post handlers search @mongo @elastic', () => {
  let posts = [],
      feedId = null,
      postIds = [];

  function makeRequest(query, fields, sort, skip, limit) {
    return { payload: { query: query || {}, fields, sort, skip, limit } };
  }

  function run(request, reply, done) {
    handlers.searchViaPost(request, reply).then(() => done(), done);
  }

  before(done => {
    factory.makeUserPostsAndSave(30).then(data => {
      posts = data;
      postIds = posts.map(post => post._id).sort();
      feedId = posts[0]._source.feedId.toString();
      done();
    }, done);
  });

  it('returns the correct items according to query', done => {
    const query = { query: { term: { feedId } } },
          request = makeRequest({ query }, null, null, null, 3),
          reply = data => data
            .hits
            .forEach(post => expect(post._source.feedId).to.equal(feedId));
    run(request, reply, done);
  });

  it('returns the items sorted', done => {
    const sort = ['post.author:asc'],
          request = makeRequest(null, null, sort, null, 5),
          reply = data => {
            const authors = data.hits.map(post => post._source.post.author);
            expect(authors).to.eql(authors.sort());
          };
    run(request, reply, done);
  });

  it('returns only the requested fields', done => {
    const fields = ['post.author', 'post.title', 'post.guid'],
          request = makeRequest(null, fields, null, null, 5),
          reply = data => {
            data.hits.forEach(item => {
              expect(item._source.post).to.have.all.keys(['author', 'title', 'guid']);
            });
          };
    run(request, reply, done);
  });

  it('returns the results paginated', done => {
    const query = { query: { term: { feedId } } },
          request = makeRequest(query, [], ['_uid'], 0, 5),
          reply = data => {
            const ids = data.hits.map(post => post._id);
            expect(ids).to.eql(postIds.slice(0, 5));
          };
    run(request, reply, done);
  });
});
