'use strict';

const path = require('path'),
      glob = require('glob'),
      async = require('async'),
      mongoose = require('mongoose'),
      conf = require('./config/store.js'),
      Hapi = require('hapi'),
      Logger = require('srunner').Logger,
      log = new Logger(),
      Chalk = require('chalk').constructor,
      chalk = new Chalk({ enabled: true }),
      server = new Hapi.Server({});

function connectMongoose(cb) {
  const host = conf.get('mongo:host'),
        db = conf.get('mongo:database'),
        port = conf.get('mongo:port'),
        url = `mongodb://${host}:${port}/${db}`;
  mongoose.connect(url, cb);
}

function setupServer(cb) {
  server.connection({
    port: conf.get('app:port') || 8006
  });
  cb();
}

function loadRoutes(cb) {
  const components = path.join(__dirname, 'components'),
        opts = {
          nomount: false,
          cwd: components,
          root: components
        };

  log.info(chalk.blue('loading routes'));
  async.parallel({
    top: next => glob('/**/routes.js', opts, next),
    nested: next => glob('/**/routes/*.js', opts, next)
  }, (err, results) => {
    if (err) { return cb(err); }

    const files = results.top.concat(results.nested);

    files.forEach(file => {
      let routes = require(file);

      if (!Array.isArray(routes)) {
        routes = [routes];
      }

      log.info(`adding routes from ${chalk.green(file)}`);
      routes.forEach((route) => {
        try {
          server.route(route);
          log.info(`added ${chalk.blue((route || {}).method)} ${chalk.yellow((route || {}).path)}`);
        } catch (err) {
          log.error(`failed to add routes from ${chalk.red(file)}`);
          log.error(`skipped ${chalk.blue((route || {}).method)} ${chalk.yellow((route || {}).path)}`);
          log.error(err.stack || err.message);
        }
      });
    });

    cb(null);
  });
}

function registerPlugins(cb) {
  server.register([{
    register: require('http-status-decorator')
  }, {
    register: require('vision')
  }, {
    register: require('inert')
  }, {
    register: require('lout'),
    options: { endpoint: '/documentation' }
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
    log.info(`server.started ${chalk.blue(server.info.uri)}`);
    cb(err);
  });
}

async.series([
  setupServer, loadRoutes, registerPlugins, connectMongoose, startServer
], err => {
  if (err) {
    log.error(err.stack || err.message);
    throw err;
  }
});
