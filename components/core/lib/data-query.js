'use strict';

const util = require('util');

/**
 * Initializes this query object
 */
function DataQuery() {
  this.fields = {};
  this.sort = {};
  this.criteria = {};
}

DataQuery.prototype._and = function() {
  return { $and: Array.prototype.slice.call(arguments) };
};

DataQuery.prototype._or = function() {
  return { $or: Array.prototype.slice.call(arguments) };
};

DataQuery.prototype._gt = function(value) {
  return { $gt: value };
};

DataQuery.prototype._lt = function(value) {
  return { $lt: value };
};

DataQuery.prototype._gte = function(value) {
  return { $gte: value };
};

DataQuery.prototype._lte = function(value) {
  return { $lte: value };
};

DataQuery.prototype._setTextCriteria = function(search, op) {
  if (!search) { return; }

  this.sort = {
    score: { $meta: 'textScore' }
  };
  this.fields.score = {
    $meta: 'textScore'
  };
  this[op + 'Criteria']('$text', {
    $search: search
  });
};

DataQuery.prototype._setCriteria = function(name, value) {
  this.andCriteria(name, value);
};

/**
 * Returns a mongose query object ready for execution.
 *
 * @param {Object} the mongoose model
 * @returns {Object} the mongoose query object
 */
DataQuery.prototype.getQuery = function(model) {
  var query = model.find(this.criteria, this.fields).sort(this.sort);

  if (this.limit) {
    query.limit(this.limit);
  }

  query.skip(this.skip || 0);

  return query;
};

/**
 * Adds the specified limit
 *
 * @param {Number} limit
 */
DataQuery.prototype.addLimit = function(limit) {
  if (limit) {
    this.limit = parseInt(limit, 10);
  }
};

/**
 * Adds the specified skip
 *
 * @param {Number} skip
 */
DataQuery.prototype.addSkip = function(skip) {
  if (skip) {
    this.skip = parseInt(skip, 10);
  }
};

/**
 * Ands the specified text criteria to the existing criteria
 *
 * @param {String} search
 */
DataQuery.prototype.andTextCriteria = function(search) {
  this._setTextCriteria(search, 'and');
};

/**
 * Ors the specified text criteria to the existing criteria
 *
 * @param {String} search
 */
DataQuery.prototype.orTextCriteria = function(search) {
  this._setTextCriteria(search, 'or');
};

/**
 * Add criteria to be anded with the existing criteria
 *
 * @param {String} name - the criteria name
 * @param {String} value - the criteria value
 * @param {String} op - operator (gt or lt)
 */
DataQuery.prototype.andCriteria = function(name, value, op) {
  var criteria = {};
  criteria[name] = op ? this['_' + op](value) : value;
  this.criteria = util._extend(this.criteria, criteria);
};

/**
 * Add criteria to be ored with the existing criteria
 *
 * @param {String} name - the criteria name
 * @param {String} value - the criteria value
 */
DataQuery.prototype.orCriteria = function(name, value) {
  var criteria = {};
  criteria[name] = value;
  this.criteria = this.criteria ? this._or(this.criteria, criteria) : criteria;
};

/**
 * Ads the specified field to the fields to be returned
 *
 * @param {String} field - the field name
 * @param {Number} value - the field value (1 or true, 0 or false)
 */
DataQuery.prototype.addField = function(field, value) {
  this.fields[field] = value;
};

/**
 * Adds a sort field
 *
 * @param {String} field - the field name
 * @param {String} value - the sort value (1 : ascending, -1 : descending)
 */
DataQuery.prototype.addSort = function(field, value) {
  this.sort[field] = value;
};

/**
 * Parse the specified sort string and adds populates the sort fields
 *
 * @param {String} sort - a string of the form "a:asc b:desc c e"
 */
DataQuery.prototype.parseSort = function(sort) {
  if (!sort) { return; }

  sort = sort.split(/\s+/);
  sort.forEach(function(s) {
    s = s.split(':');
    this.addSort(s[0], (s[1] === 'desc') ? -1 : 1);
  }.bind(this));
};

module.exports.DataQuery = DataQuery;
