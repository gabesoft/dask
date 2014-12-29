'use strict';

var path     = require('path')
  , glob     = require('glob')
  , mongoose = require('mongoose')
  , Hapi     = require('hapi')
  , server   = new Hapi.Server({
        debug: {
            log     : [ 'error' ]
          , request : [ 'received', 'handler', 'response', 'error' ]
        }
    });


mongoose.connect('mongodb://localhost/dask', function (err) {
    if (err) {
        console.error(err);
        throw err;
    }

    var components = path.join(__dirname, 'components')
      , opts       = {
            nomount : false
          , cwd     : components
          , root    : components
        };

    server.connection({ port: 8006 });
    glob.sync('/**/routes.js', opts).forEach(function (file) {
        var routes = require(file);

        if (!Array.isArray(routes)) {
            routes = [routes];
        }

        routes.forEach(function (route) {
            server.route(route);
        });
    });

    server.start(function (err) {
        console.log('server started with connection:');
        console.log(server.connections[0].info);
        if (err) {
            console.log(err);
            throw err;
        }
    });
});
