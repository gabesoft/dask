'use strict';

const nconf = require('nconf'),
      path = require('path'),
      env = process.env.NODE_ENV || 'development',
      dir = __dirname,
      configPath = (name) => `${path.join(dir, name)}.json`,
      defaultPath = configPath('default');

nconf.overrides({
  env,
  path: {
    root: path.join(dir, '..'),
    config: process.env.DASK_CONFIG_PATH || configPath(env)
  }
});

nconf.env();
nconf.argv();
nconf.file(env, nconf.get('path:config'));
nconf.defaults(require(defaultPath));

module.exports = nconf;
