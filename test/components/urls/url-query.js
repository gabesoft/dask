'use strict';

var expect = require('chai').expect
  , Query  = require('../../../components/urls/url-query').Query
  , util   = require('util')
  , cases  = {
        'abc'                                : text('abc')
      , 'abc def'                            : text('abc def')
      , 'abc def ghk & #java'                : and(text('abc def ghk'), tag('java'))
      , '#java abc def ghk'                  : and(tag('java'), text('abc def ghk'))
      , '#java'                              : tag('java')
      , '#java & #linux'                     : and(tag('java'), tag('linux'))
      , "#java & #linux | #bash"             : and(tag('java'), or(tag('linux'), tag('bash')))
      , '#java & (#linux | #bash)'           : and(tag('java'), or(tag('linux'), tag('bash')))
      , '#java & #ruby | #linux-man & #bash' : and(tag('java'), or(tag('ruby'), and(tag('linux-man'), tag('bash'))))
      , '(#java & #ruby) | (#linux & #bash)' : or(and(tag('java'), tag('ruby')), and(tag('linux'), tag('bash')))
      , '#ruby abc def'                      : and(tag('ruby'), text('abc def'))
      , '#ruby & abc def'                    : and(tag('ruby'), text('abc def'))
      , '#ruby "abc def"'                    : and(tag('ruby'), text('"abc def"'))
      , '#ruby & "abc def"'                  : and(tag('ruby'), text('"abc def"'))
      , '#ruby & #java-doc & abc & def'      : and(tag('ruby'), and(tag('java-doc'), and(text('abc'), text('def'))))
      , '#ruby & abcd | (#java & #linux)'    : and(tag('ruby'), or(text('abcd'), and(tag('java'), tag('linux'))))
    };

function text (str) {
    return { $text: { $search: str } };
}

function tag (name) {
    return { tags: name };
}

function or () {
    return { $or: Array.prototype.slice.call(arguments) };
}

function and () {
    return { $and: Array.prototype.slice.call(arguments) };
}

describe('url-query', function () {
    it('populates criteria, projection, and sort', function () {
        var q = new Query();
        expect(q.criteria).to.eql({});
        expect(q.fields).to.eql({});
        expect(q.sort).to.eql({});
    });

    it('adds score to fields for text searches', function () {
        expect(new Query('abcd').fields).to.eql({ score: { $meta: 'textScore' } });
    });

    it('adds score to sort for text searches', function () {
        expect(new Query('abcd').sort).to.eql({ score: { $meta: 'textScore' } });
    });

    Object.keys(cases).forEach(function (qstr) {
        it('query: ' + qstr, function () {
            expect(new Query(qstr).criteria).to.eql(cases[qstr]);
        });
    });
});
