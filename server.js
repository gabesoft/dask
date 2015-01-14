'use strict';

var path     = require('path')
  , glob     = require('glob')
  , async    = require('async')
  , mongoose = require('mongoose')
  , Hapi     = require('hapi')
  , server   = new Hapi.Server({});

function connectMongoose (cb) {
    // TODO: get db url from config
    mongoose.connect('mongodb://localhost/dask', cb);
}

function setupServer (cb) {
    server.connection({ port: 8006 });
    cb(null);
}

function loadRoutes (cb) {
    var components = path.join(__dirname, 'components')
      , opts       = {
            nomount : false
          , cwd     : components
          , root    : components
        };

    glob('/**/routes.js', opts, function (err, files) {
        if (err) { return cb(err); }

        files.forEach(function (file) {
            var routes = require(file);

            if (!Array.isArray(routes)) {
                routes = [routes];
            }

            routes.forEach(function (route) {
                try {
                    server.route(route);
                } catch (e) {
                    console.log('failed to add routes', file, e);
                }
            });
        });

        cb(null);
    });
}

function registerPlugins (cb) {
    server.register([{
        register : require('http-status-decorator')
    }, {
        register : require('good')
      , options  : {
            logRequestPayload  : true
          , logResponsePayload : true
          , reporters          : [{
                reporter : require('good-console')
              , args     : [
                    { log: '*', response : '*', error: '*' }
                  , { format: 'hh:mm:ss.SSS' } ]
            }]
        }
    }], cb);
}

function startServer (cb) {
    server.start(function (err) {
        console.log('server started: ', server.info.uri);
        cb(err);
    });
}

async.series([
    setupServer
  , loadRoutes
  , registerPlugins
  , connectMongoose
  , startServer
], function (err) {
    if (err) {
        console.log(err);
        throw err;
    }
});
