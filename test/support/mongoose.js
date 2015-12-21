'use strict';

const mongoose = require('mongoose'),
      async = require('async'),
      conf = require('../../config/store');

module.exports.connect = (dropCollections, cb) => {
  const host = conf.get('mongo:host'),
        db = conf.get('mongo:database'),
        port = conf.get('mongo:port'),
        url = `mongodb://${host}:${port}/${db}`;

  mongoose.connect(url, err => {
    if (err) {
      return cb(err);
    }

    async.each(dropCollections, (name, next) => {
      mongoose.connection.db.dropCollection(name, next);
    }, cb);
  });
};
