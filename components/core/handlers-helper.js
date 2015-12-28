'use strict';

const SKIP = 0,
      LIMIT = 10000,
      Promise = require('bluebird').Promise;

function ensureExists(doc, name, id) {
  if (doc) {
    return doc;
  } else {
    throw new Error(`A ${name} with id ${id} was not found`);
  }
}

class Helper {
  constructor(Model) {
    this.Model = Model;
  }

  searchViaGet(request) {
    const data = request.query || {};
    return this.search(data.query,
                       data.fields,
                       data.sort,
                       data.skip || data.from,
                       data.limit || data.size);
  }

  searchViaPost(request) {
    const data = request.payload || {};
    return this.search(data.query,
                       data.fields,
                       data.sort,
                       data.skip || data.from,
                       data.limit || data.size);
  }

  search(query, fields, sort, skip, limit) {
    skip = skip || SKIP;
    limit = limit || LIMIT;

    fields = Array.isArray(fields) ? fields.join(' ') : fields;
    sort = Array.isArray(sort) ? sort.join(' ') : sort;

    return this.Model
      .find(query, fields)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .exec();
  }

  create(data) {
    return new this.Model(data || {}).save();
  }

  read(id) {
    return this.Model.findById(id);
  }

  remove(id) {
    return this.Model
      .findById(id)
      .then(doc => ensureExists(doc, this.Model.modelName, id))
      .then(doc => doc.remove());
  }

  replace(data, id) {
    id = data.id || id;
    data = Object.assign({ $unset: {} }, data || {});

    const opts = { new: true, upsert: false, runValidators: true };

    this.Model.schema
      .getPaths(['_id', '__v'])
      .filter(path => !(path in data))
      .forEach(path => data.$unset[path] = 1);

    return this.Model.findOneAndUpdate({ _id: id }, data, opts);
  }

  update(data, id) {
    id = data.id || id;

    return this.Model
      .findById(id)
      .then(doc => ensureExists(doc, this.Model.modelName, id))
      .then(doc => doc.set(data || {}).save());
  }

  bulk(op, data) {
    const promises = (data || [])
            .map(op)
            .map(promise => Promise.resolve(promise).reflect());

    return Promise
      .all(promises)
      .map(promise => promise.isFulfilled() ? promise.value() : promise.reason());
  }

  bulkCreate(data) {
    return this.bulk(this.create.bind(this), data);
  }

  bulkRemove(data) {
    return this.bulk(this.remove.bind(this), data);
  }

  bulkReplace(data) {
    return this.bulk(this.replace.bind(this), data);
  }

  bulkUpdate(data) {
    return this.bulk(this.update.bind(this), data);
  }
}

module.exports = Helper;