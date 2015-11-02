'use strict';

const path = require('path'),
      glob = require('glob'),
      async = require('async'),
      mongoose = require('mongoose'),
      redis = require('redis'),
      conf = require('./config/store.js'),
      Hapi = require('hapi'),
      server = new Hapi.Server({});

function connectMongoose(cb) {
  const host = conf.get('mongo:host'),
        db = conf.get('mongo:database'),
        port = conf.get('mongo:port'),
        url = `mongodb://${host}:${port}/${db}`;
  mongoose.connect(url, cb);
}

function connectRedis(cb) {
  const port = conf.get('redis:port'),
        host = conf.get('redis.host'),
        opts = {},
        client = redis.createClient(port, host, opts);

  client.on('ready', function() {
    server.app.redis = client;
    cb();
  });
  client.on('error', cb);
  client.on('error', function(err) {
    console.log(err);
  });
}

function setupServer(cb) {
  server.connection({
    port: conf.get('app:port') || 8006
  });
  cb(null);
}

function loadRoutes(cb) {
  const components = path.join(__dirname, 'components'),
        opts = {
          nomount: false,
          cwd: components,
          root: components
        };

  glob('/**/routes.js', opts, (err, files) => {
    if (err) { return cb(err); }

    files.forEach(file => {
      let routes = require(file);

      if (!Array.isArray(routes)) {
        routes = [routes];
      }

      routes.forEach((route) => {
        try {
          server.route(route);
        } catch (routeErr) {
          console.log('failed to add routes', file, routeErr);
        }
      });
    });

    return cb(null);
  });
}

function registerPlugins(cb) {
  server.register([{
    register: require('http-status-decorator')
  }, {
    register: require('good'),
    options: {
      reporters: [{
        reporter: require('good-console'),
        events: { log: '*', response: '*', error: '*' },
        config: { format: 'hh:mm:ss.SSS' }
      }]
    }
  }], cb);
}

function startServer(cb) {
  server.start(err => {
    console.log('server started: ', server.info.uri);
    cb(err);
  });
}

async.series([
  setupServer, loadRoutes, registerPlugins, connectMongoose, connectRedis, startServer
], err => {
  if (err) {
    console.log(err);
    throw err;
  }
});
