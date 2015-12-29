'use strict';

const client = require('../../elasticsearch'),
      conf = require('../../config/store'),
      base = conf.get('elasticsearch:base-index'),
      indexName = `${base}-rss`,
      typeName = 'post';

function getPostId(data) {
  return data._id || `${data.postId}-${data.subscriptionId}`;
}

function search(params) {
  const opts = Object.assign({
    index: indexName,
    type: typeName
  }, params);
  return client.search(opts);
}

function scrollUntilDone(acc, promise) {
  return promise.then(res => {
    acc = acc.concat(res.hits.hits);

    if (acc.length === res.hits.total) {
      return acc;
    } else {
      return scrollUntilDone(
        acc,
        client.scroll({ scrollId: res._scroll_id, scroll: '30s' })
      );
    }
  });
}

function scroll(params) {
  const opts = Object.assign({
    index: indexName,
    type: typeName,
    searchType: 'scan',
    scroll: '30s'
  }, params);
  return scrollUntilDone([], client.search(opts));
}

function count(params) {
  return client.count({ index: indexName, type: typeName, body: params });
}

function index(posts, update) {
  const body = posts.reduce((acc, post) => {
    const op = {
      _index: indexName,
      _type: typeName,
      _id: getPostId(post)
    };

    acc.push(update ? { update: op } : { index: op });
    acc.push(update ? { doc: post } : post);
    return acc;
  }, []);

  return client
    .bulk({ body })
    .then(results => client
          .indices
          .refresh({ index: indexName })
          .then(() => results.items.map(item => item.index || item.update)));
}

function removeById(id) {
  return client
    .delete({ index: indexName, type: typeName, id })
    .then(results => client
          .indices
          .refresh({ index: indexName })
          .then(() => results));
}

function remove(posts) {
  const body = posts.map(post => {
    return {
      delete: {
        _index: indexName,
        _type: typeName,
        _id: getPostId(post)
      }
    };
  });
  return client
    .bulk({ body })
    .then(results => client
          .indices
          .refresh({ index: indexName })
          .then(() => results.items.map(item => item.delete)));
}

module.exports = {
  index: posts => index(posts, false),
  update: posts => index(posts, true),
  remove,
  removeById,
  search,
  scroll,
  count
};
