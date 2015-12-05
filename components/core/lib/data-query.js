'use strict';

const util = require('util');

class DataQuery {
  /**
   * Initializes this query object
   */
  constructor() {
    this.fields = {};
    this.sort = {};
    this.criteria = {};
  }

  _and() {
    return { $and: Array.prototype.slice.call(arguments) };
  }

  _or() {
    return { $or: Array.prototype.slice.call(arguments) };
  }

  _in(value) {
    return { $in: value };
  }

  _gt(value) {
    return { $gt: value };
  }

  _lt(value) {
    return { $lt: value };
  }

  _gte(value) {
    return { $gte: value };
  }

  _lte(value) {
    return { $lte: value };
  }

  _setTextCriteria(search, op) {
    if (!search) {
      return;
    }

    this.sort = {
      score: {
        $meta: 'textScore'
      }
    };
    this.fields.score = {
      $meta: 'textScore'
    };
    this[op + 'Criteria']('$text', {
      $search: search
    });
  }

  _setCriteria(name, value) {
    this.andCriteria(name, value);
  }

  /**
   * Returns a mongose query object ready for execution.
   *
   * @param {Object} the mongoose model
   * @returns {Object} the mongoose query object
   */
  getQuery(model) {
    const query = model.find(this.criteria, this.fields).sort(this.sort);

    if (this.limit) {
      query.limit(this.limit);
    }

    query.skip(this.skip || 0);

    return query;
  }

  /**
   * Adds the specified limit
   *
   * @param {Number} limit
   */
  addLimit(limit) {
    if (limit) {
      this.limit = parseInt(limit, 10);
    }
  }

  /**
   * Adds the specified skip
   *
   * @param {Number} skip
   */
  addSkip(skip) {
    if (skip) {
      this.skip = parseInt(skip, 10);
    }
  }

  /**
   * Ands the specified text criteria to the existing criteria
   *
   * @param {String} search
   */
  andTextCriteria(search) {
    this._setTextCriteria(search, 'and');
  }

  /**
   * Ors the specified text criteria to the existing criteria
   *
   * @param {String} search
   */
  orTextCriteria(search) {
    this._setTextCriteria(search, 'or');
  }

  /**
   * Add criteria to be anded with the existing criteria
   *
   * @param {String} name - the criteria name
   * @param {String} value - the criteria value
   * @param {String} op - operator (gt or lt)
   */
  andCriteria(name, value, op) {
    const criteria = {};
    criteria[name] = op ? this['_' + op](value) : value;
    this.criteria = util._extend(this.criteria, criteria);
  }

  /**
   * Add criteria to be ored with the existing criteria
   *
   * @param {String} name - the criteria name
   * @param {String} value - the criteria value
   */
  orCriteria(name, value) {
    const criteria = {};
    criteria[name] = value;
    this.criteria = this.criteria ? this._or(this.criteria, criteria) : criteria;
  }

  /**
   * Ads the specified field to the fields to be returned
   *
   * @param {String} field - the field name
   * @param {Number} value - the field value (1 or true, 0 or false)
   */
  addField(field, value) {
    this.fields[field] = value;
  }

  /**
   * Adds a sort field
   *
   * @param {String} field - the field name
   * @param {String} value - the sort value (1 : ascending, -1 : descending)
   */
  addSort(field, value) {
    this.sort[field] = value;
  }

  /**
   * Parse the specified sort string and adds populates the sort fields
   *
   * @param {String} sort - a string of the form "a:asc b:desc c e"
   */
  parseSort(sort) {
    if (!sort) {
      return;
    }

    sort = sort.split(/\s+/);
    sort.forEach(text => {
      text = text.split(':');
      this.addSort(text[0], (text[1] === 'desc') ? -1 : 1);
    });
  }
}

module.exports.DataQuery = DataQuery;
