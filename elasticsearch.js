'use strict';

const conf = require('./config/store'),
      es = require('elasticsearch'),
      opts = conf.get('elasticsearch'),
      client = new es.Client({
        host: `${opts.host}:${opts.port}`,
        log: opts['log-level'],
        apiVersion: opts['api-version']
      });

process.on('exit', () => client.close());

module.exports = client;
