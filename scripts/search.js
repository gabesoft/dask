/* eslint no-shadow:0, no-unused-vars:0, max-len:[2, 120] */

'use strict';

const chalk = require('chalk'),
      conf = require('../config/store'),
      path = require('path'),
      es = require('elasticsearch'),
      helper = require('./search-helper'),
      yargs = require('yargs')
        .usage(`Usage: $0 ${chalk.blue('<command>')} ${chalk.yellow('[options]')}`)
        .command('mapping', chalk.blue('updates a document mapping'), (yargs, argv) => {
          argv = yargs
            .option('f', {
              description: chalk.yellow('mapping file in json format'),
              alias: 'file',
              demand: true,
              type: 'string'
            })
            .option('i', {
              description: chalk.yellow('elastic search index name'),
              alias: 'index',
              demand: true,
              type: 'string'
            })
            .option('t', {
              description: chalk.yellow('document type'),
              alias: 'type',
              default: 'post'
            })
            .option('p', {
              description: chalk.yellow('elastic search server port'),
              alias: 'port',
              default: conf.get('elasticsearch:port')
            })
            .option('h', {
              description: chalk.yellow('elastic search server host'),
              alias: 'host',
              default: conf.get('elasticsearch:host')
            })
            .option('a', {
              description: chalk.yellow('elastic search api version'),
              alias: 'api',
              default: conf.get('elasticsearch:api-version')
            })
            .argv;
        })
        .command('reindex', chalk.blue('re-indexes data from one index to another'), (yargs, argv) => {
          argv = yargs
            .option('s', {
              description: chalk.yellow('the source index'),
              alias: 'source',
              demand: true,
              type: 'string'
            })
            .option('d', {
              description: chalk.yellow('the destination index'),
              alias: 'destination',
              demand: true,
              type: 'string'
            })
            .option('t', {
              description: chalk.yellow('document type'),
              alias: 'type',
              default: 'post'
            })
            .option('p', {
              description: chalk.yellow('elastic search server port'),
              alias: 'port',
              default: conf.get('elasticsearch:port')
            })
            .option('h', {
              description: chalk.yellow('elastic search server host'),
              alias: 'host',
              default: conf.get('elasticsearch:host')
            })
            .option('a', {
              description: chalk.yellow('elastic search api version'),
              alias: 'api',
              default: conf.get('elasticsearch:api-version')
            })
            .argv;
        }),
      argv = yargs.argv;

function makeClient() {
  const host = argv.host || conf.get('elasticsearch:host'),
        port = argv.port || conf.get('elasticsearch:port'),
        version = argv.api || conf.get('elasticsearch:api-version');
  return new es.Client({
    host: `${host}:${port}`,
    log: ['error'],
    apiVersion: version
  });
}

switch (argv._[0]) {
case 'mapping':
  helper.mapping({
    client: makeClient(),
    data: require(path.join(__dirname, '..', argv.file)),
    type: argv.type || 'post',
    indexName: argv.index
  });
  break;
case 'reindex':
  helper.reindex({
    client: makeClient(),
    type: argv.type || 'post',
    sourceIndex: argv.source,
    targetIndex: argv.destination
  });
  break;
default:
  yargs.showHelp();
  process.exit(0);
  break;
}
