'use strict';

const handler = require('./handlers'),
      useRedis = require('../../redis').useClientAsync;

function makeKey(key) {
  return 'vplugkeyword:' + key;
}

function setKeywords(request, reply) {
  const payload = request.payload,
        data = [];

  payload.forEach(keyword => {
    data.push(makeKey(keyword.key));
    data.push(JSON.stringify(keyword));
  });

  useRedis(client => client.msetAsync(data))
    .then(res => reply(res), err => reply.boom(err));
}

function getKeywords(request, reply) {
  useRedis(client => {
    return client.keysAsync(makeKey('*'))
      .then(keys => keys.length > 0 ? client.mgetAsync(keys) : []);
  }).then(data => reply(data.map(JSON.parse)), err => reply.boom(err));
}

function delKeywords(request, reply) {
  useRedis(client => {
    return client.keysAsync(makeKey('*'))
      .then(keys => keys.length > 0 ? client.delAsync(keys) : []);
  }).then(data => reply(data), err => reply.boom(err));
}

module.exports = [{
  method: 'POST',
  path: '/vplugs',
  handler: handler.create
}, {
  method: 'GET',
  path: '/vplugs',
  handler: handler.search
}, {
  method: 'GET',
  path: '/vplugs/{id}',
  handler: handler.read
}, {
  method: 'DELETE',
  path: '/vplugs/{id}',
  handler: handler.remove
}, {
  method: ['PUT', 'PATCH'],
  path: '/vplugs/{id}',
  handler: handler.update
}, {
  method: 'POST',
  path: '/vplugkeywords',
  handler: setKeywords
}, {
  method: 'DELETE',
  path: '/vplugkeywords',
  handler: delKeywords
}, {
  method: 'GET',
  path: '/vplugkeywords',
  handler: getKeywords
}];