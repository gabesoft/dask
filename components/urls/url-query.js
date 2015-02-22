'use strict';

var parser = require('./query-parser');

function Query (input) {
    this.parse((input || '').trim());
    this.initCriteria();
    this.initFields();
    this.initSort();
}

function tag (str) {
    return { tags: str };
}

function text (str) {
    return { $text: { $search: str } };
}

function and () {
    return { $and: Array.prototype.slice.call(arguments) };
}

function or () {
    return { $or: Array.prototype.slice.call(arguments) };
}

function reduce (obj, acc, fn) {
    if (!obj) { return acc; }

    acc = fn(acc, obj);

    if (Array.isArray(obj)) {
        obj.forEach(function (o) {
            acc = reduce(o, acc, fn);
        });
    } else if (Object.prototype.toString.call(obj) === '[object Object]') {
        Object.keys(obj).forEach(function (k) {
            acc = reduce(obj[k], acc, fn);
        });
    }

    return acc;
}

function criteria (ast) {
    if (!ast || ast.length === 0) { return null; }

    if (!Array.isArray(ast)) {
        if (ast.match(/^#/)) {
            return tag(ast.replace(/^#/, ''));
        } else {
            return text(ast);
        }
    }

    if (ast.length === 3) {
        switch (ast[1]) {
            case '&': return and(criteria(ast[0]), criteria(ast[2]));
            case '|': return or(criteria(ast[0]), criteria(ast[2]));
        }
    }
}

function toStr (criteria) {
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

Query.prototype.parse = function (input) {
    try {
        this.ast = input ? parser.parse(input) : [];
    } catch (e) {
        console.log('query parse failed');
        console.log(input, e);
        this.ast = [];
    }
};

Query.prototype.toString = function () {
    return toStr(this.criteria);
};

Query.prototype.initCriteria = function () {
    this.criteria = criteria(this.ast) || {};
    this.textSearch = reduce(this.criteria, false, function (acc, c) {
        return acc || (c && Boolean(c.$text));
    });
};

Query.prototype.initFields = function () {
    this.fields = this.textSearch ? { score: { $meta: 'textScore' } } : {};
};

Query.prototype.initSort = function () {
    this.sort = this.textSearch ? { score: { $meta: 'textScore' } } : {};
};

Query.prototype.addSort = function (sort) {
    if (!sort) { return; }

    sort = sort.split('/\s+/');
    sort.forEach(function (s) {
        s = s.split(':');
        this.sort[s[0]] = (s[1] === 'desc') ? -1 : 1;
    }.bind(this));
};


module.exports.Query = Query;
