/* eslint max-len:[2, 120] */

'use strict';

const chalk = require('chalk'),
      Logger = require('srunner').Logger,
      log = new Logger();

function mapping(options) {
  return options.client
    .indices
    .putMapping({
      index: options.indexName,
      type: options.type,
      body: options.data
    })
    .then(
      () => {
        const host = options.client.transport._config.host,
              type = options.type,
              index = options.indexName,
              url = `http://${host}/${index}/_mapping/${type}`,
              curl = `curl -XGET ${url}`,
              http = `http GET ${url}`;

        log.info('mapping complete, verify using the commands below');
        log.info(`${chalk.yellow(curl)} | ${chalk.blue('python -m json.tool')}`);
        log.info(`${chalk.yellow(curl)} | ${chalk.blue('python -m json.tool')} | ${chalk.blue('pygmentize -l json')}`);
        log.info(`${chalk.yellow(http)}`);
      },
      err => log.error(`failed to complete mapping: ${err.message}`));
}

class Indexer {
  constructor(options) {
    this.sourceIndex = options.sourceIndex;
    this.targetIndex = options.targetIndex;
    this.type = options.type;
    this.client = options.client;
    this.timeout = '240s';
  }

  index(items) {
    const body = items.reduce((acc, item) => {
      const op = {
        _index: this.targetIndex,
        _type: this.type,
        _id: item._id
      };

      acc.push({ index: op });
      acc.push(item._source);
      return acc;
    }, []);

    return this.client
      .bulk({ body })
      .then(
        () => log.info(`indexed ${chalk.blue(items.length)}`),
        err => log.error(`index failed ${err.message}`));
  }

  reindex() {
    const promise = this.client.search({
      index: this.sourceIndex,
      type: this.type,
      searchType: 'scan',
      scroll: this.timeout,
      size: 100,
      body: { query: { match_all: {} } }
    });

    return this
      .more(0, promise)
      .then(() => this.client.indices.refresh({ index: this.targetIndex }))
      .then(() => log.info('reindex done'), err => log.error(`reindex failed ${err.message}`));
  }

  more(count, promise) {
    return promise.then(res => {
      const total = res.hits.total;

      if (res.hits.hits.length === 0 && count < total) {
        return this.more(count, this.client.scroll({
          scrollId: res._scroll_id, scroll: this.timeout
        }));
      }

      return this
        .index(res.hits.hits)
        .then(() => {
          if (count === total) {
            log.info(`indexed ${chalk.blue(count)} records`);
            return count;
          } else {
            count = count + res.hits.hits.length;
            log.info(`indexed ${chalk.magenta(count)}/${chalk.blue(total)}`);
            return this.more(count, this.client.scroll({
              scrollId: res._scroll_id, scroll: this.timeout
            }));
          }
        });
    });
  }
}

module.exports = {
  reindex: options => new Indexer(options).reindex(),
  mapping
};
