'use strict';

const parser = require('./query-parser'),
      DataQuery = require('../core/lib/data-query').DataQuery,
      InvalidQueryError = require('../core/errors/invalid-query');

class Query extends DataQuery {
  constructor() {
    super();
  }

  parse(input) {
    this.input = (input || '').trim();
    this._parse();
    this._initCriteria();
    this._initFields();
    this._initSort();
  }

  _parse() {
    try {
      this.ast = this.input ? parser.parse(this.input) : [];
    } catch (e) {
      this.error = new InvalidQueryError(e.message, this.input);
      this.ast = [];
    }
  }

  toString() {
    return toStr(this.criteria);
  }

  _initCriteria() {
    this.criteria = criteria(this.ast) || {};
    this.textSearch = reduce(this.criteria, false, function(acc, c) {
      return acc || (c && Boolean(c.$text));
    });
    this.textCount = reduce(this.criteria, 0, function(acc, c) {
      return acc + (Boolean(c.$text) ? 1 : 0);
    });
    if (!this.error && this.textCount > 1) {
      this.error = new InvalidQueryError("Only one text expression is allowed", this.input);
    }
  }

  _initFields() {
    if (this.textSearch) {
      this.addField('score', {
        $meta: 'textScore'
      });
    }
  }

  _initSort() {
    if (this.textSearch) {
      this.addSort('score', {
        $meta: 'textScore'
      });
    }
  }
}

function tag(str) {
  return {
    tags: str
  };
}

function text(str) {
  return {
    $text: {
      $search: str
    }
  };
}

function and() {
  return {
    $and: Array.prototype.slice.call(arguments)
  };
}

function or() {
  return {
    $or: Array.prototype.slice.call(arguments)
  };
}

function reduce(obj, acc, fn) {
  if (!obj) {
    return acc;
  }

  acc = fn(acc, obj);

  if (Array.isArray(obj)) {
    obj.forEach(x => acc = reduce(x, acc, fn));
  } else if (Object.prototype.toString.call(obj) === '[object Object]') {
    Object.keys(obj).forEach(x => acc = reduce(obj[x], acc, fn));
  }

  return acc;
}

function criteria(ast) {
  if (!ast || ast.length === 0) {
    return null;
  }

  if (!Array.isArray(ast)) {
    if (ast.match(/^#/)) {
      return tag(ast.replace(/^#/, ''));
    }

    return text(ast);
  }

  if (ast.length === 3) {
    switch (ast[1]) {
    case '&':
      return and(criteria(ast[0]), criteria(ast[2]));
    case '|':
      return or(criteria(ast[0]), criteria(ast[2]));
    default:
      break;
    }
  }
}

function toStr(criteriaObj) {
  if (criteriaObj.$and) {
    return '(' + criteriaObj.$and.map(toStr).join(' & ') + ')';
  } else if (criteriaObj.$or) {
    return '(' + criteriaObj.$or.map(toStr).join(' | ') + ')';
  } else if (criteriaObj.$text) {
    return criteriaObj.$text.$search;
  } else if (criteriaObj.tags) {
    return '#' + criteriaObj.tags;
  } else {
    return '';
  }
}

module.exports.Query = Query;
