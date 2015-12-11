'use strict';

const conf = require('./config/store'),
      redis = require('redis'),
      bluebird = require('bluebird'),
      Promise = bluebird.Promise,
      using = Promise.using,
      port = conf.get('redis:port'),
      host = conf.get('redis.host'),
      opts = {};

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

function getClientAsync() {
  return new Promise((resolve, reject) => {
    const client = redis.createClient(port, host, opts);
    client.on('ready', resolve(client));
    client.on('error', reject);
  }).disposer(client => client.quit());
}

function useClient(fn, cb) {
  using(getClientAsync(), client => fn(client)).then(data => cb(null, data), cb);
}

module.exports = {
  getClientAsync: getClientAsync,
  useClient: useClient,
  useClientAsync: fn => using(getClientAsync(), fn)
};
