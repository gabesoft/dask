'use strict';

const handlers = require('../../../../components/rss/handlers/posts'),
      expect = require('chai').expect,
      trans = require('trans'),
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

describe('post handlers crud @mongo', () => {
  describe('create', () => {
    it('returns the new post', done => {
      const request = makeRequest(factory.makePost().toObject()),
            reply = data => {
              expect(data.id).to.be.a('string');
              expect(data.guid).to.equal(request.payload.guid);
              expect(data.link).to.equal(request.payload.link);
              return { created: (url) => expect(url).to.equal(`${PATH}/${data.id}`) };
            };
      run(request, reply, 'createPost', done);
    });

    it('returns an error for a conflict', done => {
      factory.makePostAndSave().then(post => {
        const payload = post.toObject(),
              request = makeRequest(payload),
              reply = data => {
                expect(data.id).to.be.an('undefined');
                expect(data.isBoom).to.be.equal(true);
              };
        run(request, reply, 'createPost', done);
      });
    });


    it('returns an error for an invalid post', done => {
      const payload = factory.makePost().toObject(),
            request = makeRequest(payload),
            reply = data => {
              expect(data.id).to.be.an('undefined');
              expect(data.isBoom).to.be.equal(true);
            };

      delete payload.guid;
      run(request, reply, 'createPost', done);
    });
  });

  describe('read', () => {
    it('returs the post matching an id', done => {
      factory.makePostAndSave().then(post => {
        const params = { id: post.get('id') },
              request = makeRequest(null, params),
              reply = data => {
                expect(data.id).to.equal(post.get('id'));
                expect(data.guid).to.equal(post.get('guid'));
              };
        run(request, reply, 'readPost', done);
      });
    });

    it('returns an error for an invalid id', done => {
      const params = { id: 'abcd' },
            request = makeRequest(null, params),
            reply = data => expect(data.isBoom).to.equal(true);
      run(request, reply, 'readPost', done);
    });

    it('returns an error for a non existing id', done => {
      const params = { id: factory.makePost().get('id') },
            request = makeRequest(null, params),
            reply = data => expect(data.isBoom).to.equal(true);
      run(request, reply, 'readPost', done);
    });
  });

  describe('replace', () => {
    it('returns the replaced post', done => {
      factory.makePostAndSave().then(oldPost => {
        const newPost = factory.makePost(),
              params = { id: oldPost.get('id') },
              payload = trans(newPost)
                .map('toObject')
                .mapf('feedId', 'toString')
                .omit('id', 'pubdate', 'title', 'description')
                .value(),
              request = makeRequest(payload, params),
              reply = data => expect(trans(data)
                                     .mapf('feedId', 'toString')
                                     .omit('id')
                                     .value()).to.deep.equal(payload);
        run(request, reply, 'replacePost', done);
      });
    });

    it('returns an error if the post is invalid', done => {
      factory.makePostAndSave().then(oldPost => {
        const newPost = factory.makePost(),
              params = { id: oldPost.get('id') },
              payload = trans(newPost)
                .map('toObject')
                .mapf('feedId', 'toString')
                .omit('id', 'guid', 'link')
                .value(),
              request = makeRequest(payload, params),
              reply = data => expect(data.isBoom).to.equal(true);
        run(request, reply, 'replacePost', done);
      });
    });

    it('returns an error if the post is not found', done => {
      const post = factory.makePost(),
            params = { id: post.get('id') },
            payload = post.toObject(),
            request = makeRequest(payload, params),
            reply = data => expect(data.isBoom).to.equal(true);
      run(request, reply, 'replacePost', done);
    });
  });

  describe('update', () => {
    it('returns the updated post', done => {
      factory.makePostAndSave().then(oldPost => {
        const newPost = factory.makePost(),
              params = { id: oldPost.get('id') },
              payload = trans(newPost).map('toObject').remove('id', 'feedId', 'title').value(),
              request = makeRequest(payload, params),
              reply = data => {
                const expected = trans(payload)
                        .mapf('title', () => oldPost.get('title'))
                        .mapf('feedId', () => oldPost.get('feedId'))
                        .mapf('id', () => oldPost.get('id'))
                        .value();
                expect(data).to.deep.equal(expected);
              };
        run(request, reply, 'updatePost', done);
      });
    });

    it('returns an error if the post is not found', done => {
      const post = factory.makePost(),
            params = { id: post.get('id') },
            payload = post.toObject(),
            request = makeRequest(payload, params),
            reply = data => expect(data.isBoom).to.equal(true);
      run(request, reply, 'updatePost', done);
    });
  });

  describe('delete', () => {
    it('returns the deleted post', done => {
      factory.makePostAndSave().then(post => {
        const params = { id: post.get('id') },
              request = makeRequest(null, params),
              reply = data => expect(data.id).to.equal(post.get('id'));
        run(request, reply, 'removePost', done);
      });
    });

    it('returns an error if the post is not found', done => {
      const post = factory.makePost(),
            params = { id: post.get('id') },
            request = makeRequest(null, params),
            reply = data => expect(data.isBoom).to.equal(true);
      run(request, reply, 'removePost', done);
    });
  });
});
