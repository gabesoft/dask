'use strict';

var parser = require('./query-parser'),
    DataQuery = require('../core/lib/data-query').DataQuery,
    util = require('util'),
    InvalidQueryError = require('../core/errors/invalid-query');

function Query() {
    Query.super_.call(this);
}

util.inherits(Query, DataQuery);

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
        obj.forEach(function(o) {
            acc = reduce(o, acc, fn);
        });
    } else if (Object.prototype.toString.call(obj) === '[object Object]') {
        Object.keys(obj).forEach(function(k) {
            acc = reduce(obj[k], acc, fn);
        });
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
        } else {
            return text(ast);
        }
    }

    if (ast.length === 3) {
        switch (ast[1]) {
            case '&':
                return and(criteria(ast[0]), criteria(ast[2]));
            case '|':
                return or(criteria(ast[0]), criteria(ast[2]));
        }
    }
}

function toStr(criteria) {
    if (criteria.$and) {
        return '(' + criteria.$and.map(toStr).join(' & ') + ')';
    } else if (criteria.$or) {
        return '(' + criteria.$or.map(toStr).join(' | ') + ')';
    } else if (criteria.$text) {
        return criteria.$text.$search;
    } else if (criteria.tags) {
        return '#' + criteria.tags;
    } else {
        return '';
    }
}

Query.prototype.parse = function(input) {
    this.input = (input || '').trim();
    this._parse();
    this._initCriteria();
    this._initFields();
    this._initSort();
};


Query.prototype._parse = function() {
    try {
        this.ast = this.input ? parser.parse(this.input) : [];
    } catch (e) {
        this.error = new InvalidQueryError(e.message, this.input);
        this.ast = [];
    }
};

Query.prototype.toString = function() {
    return toStr(this.criteria);
};

Query.prototype._initCriteria = function() {
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
};

Query.prototype._initFields = function() {
    if (this.textSearch) {
        this.addField('score', {
            $meta: 'textScore'
        });
    }
};

Query.prototype._initSort = function() {
    if (this.textSearch) {
        this.addSort('score', {
            $meta: 'textScore'
        });
    }
};

module.exports.Query = Query;