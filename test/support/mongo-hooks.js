'use strict';

const mongoose = require('mongoose'),
      conf = require('../../config/store'),
      host = conf.get('mongo:host'),
      db = conf.get('mongo:database'),
      port = conf.get('mongo:port'),
      url = `mongodb://${host}:${port}/${db}`;

before(done => {
  mongoose.connect(url, done);
});

after(done => {
  mongoose.connection.db.dropDatabase(() => mongoose.connection.close(done));
});
