'use strict';

const handlers = require('../../../../components/rss/handlers/posts'),
      expect = require('chai').expect,
      factory = require('../../../support/factories/rss');

describe('post handlers search @mongo', () => {
  let posts = [],
      ids = [];

  function makeRequest(query, fields, sort, skip, limit) {
    return { payload: { query: query || { _id: { $in: ids } }, fields, sort, skip, limit } };
  }

  function run(request, reply, done) {
    handlers.searchPosts(request, reply).then(() => done(), done);
  }

  before(() => {
    posts = factory.makePostsAndSave(30);
    ids = posts.map(post => post.get('id'));
  });

  it('returns an array even for a single element', done => {
    const request = makeRequest({ _id: ids[0] }),
          reply = data => expect(data.length).to.equal(1);
    run(request, reply, done);
  });

  it('returns the required records', done => {
    const selected = ids.slice(3, 10),
          request = makeRequest({ _id: { $in: selected } }),
          reply = data => expect(data.map(post => post.id)).to.eql(selected);
    run(request, reply, done);
  });

  it('returns only the required fields and id', done => {
    const fields = ['author', 'guid', 'title'],
          request = makeRequest(null, fields, null, 0, 5),
          reply = data => {
            const expected = fields.concat(['id']);
            data.forEach(item => expect(item).to.have.all.keys(expected));
          };
    run(request, reply, done);
  });

  it('returns only the required records by start and limit', done => {
    const request = makeRequest(null, null, null, 3, 10),
          reply = data => {
            const expected = ids.slice(3, 13);
            expect(data.map(post => post.id)).to.eql(expected);
          };
    run(request, reply, done);
  });

  it('returns the records sorted by the sort criteria', done => {
    const request = makeRequest(null, null, 'author', 0, 10),
          reply = data => {
            const expected = posts
                    .map(post => post.get('author'))
                    .sort()
                    .slice(0, 10);
            expect(data.map(post => post.author)).to.eql(expected);
          };
    run(request, reply, done);
  });
});
