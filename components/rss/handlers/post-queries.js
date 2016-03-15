'use strict';

const Model = require('../post-query-model'),
      responder = require('../../core/responder'),
      util = require('util'),
      Helper = require('../../core/handlers-helper').Helper,
      helper = new Helper(Model);

function parseData(doc) {
  if (util.isArray(doc)) {
    return doc.map(parseData);
  } else if (doc) {
    return doc.set('data', JSON.parse(doc.get('dataJSON')));
  }
  return null;
}

function stringifyData(payload) {
  payload = payload || {};

  const data = payload.data;
  payload.dataJSON = data.JSON || JSON.stringify(data);

  delete payload.data;
  return payload;
}

function searchViaGet(request) {
  return helper.searchViaGet(request).then(parseData);
}

function searchViaPost(request) {
  return helper.searchViaPost(request).then(parseData);
}

function bulkRemoveQueries(request) {
  return helper.bulkRemove(request.payload.map(stringifyData));
}

function bulkUpdateQueries(request) {
  return helper.bulkUpdate(request.payload.map(stringifyData));
}

function bulkReplaceQueries(request) {
  return helper.bulkReplace(request.payload.map(stringifyData));
}

function bulkCreateQueries(request) {
  return helper.bulkCreate(request.payload.map(stringifyData));
}

function removeQuery(request) {
  return helper.remove(request.params.id);
}

function updateQuery(request) {
  return helper
    .update(stringifyData(request.payload), request.params.id)
    .then(parseData);
}

function replaceQuery(request) {
  return helper
    .replace(stringifyData(request.payload), request.params.id)
    .then(parseData);
}

function createQuery(request) {
  return new Model(stringifyData(request.payload))
    .save()
    .then(parseData);
}

function readQuery(request) {
  return helper
    .read(request.params.id)
    .then(parseData);
}

const methods = {
  bulkRemoveQueries: { method: bulkRemoveQueries, response: 'bulkRemoved' },
  bulkUpdateQueries: { method: bulkUpdateQueries, response: 'bulkUpdated' },
  bulkReplaceQueries: { method: bulkReplaceQueries, response: 'bulkReplaced' },
  bulkCreateQueries: { method: bulkCreateQueries, response: 'bulkCreated' },
  removeQuery: { method: removeQuery, response: 'removed' },
  updateQuery: { method: updateQuery, response: 'updated' },
  replaceQuery: { method: replaceQuery, response: 'replaced' },
  createQuery: { method: createQuery, response: 'created' },
  readQuery: { method: readQuery, response: 'read' },
  searchViaPost: { method: searchViaPost, response: 'search' },
  searchViaGet: { method: searchViaGet, response: 'search' }
};

Object.keys(methods).forEach(name => {
  const data = methods[name];
  module.exports[name] = responder.decorate(data.method, data.response);
});
