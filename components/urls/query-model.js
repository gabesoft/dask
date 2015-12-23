'use strict';

var mongoose = require('mongoose')
  , md5      = require('../core/md5-hash')
  , Types    = mongoose.Schema.Types
  , schema   = require('../core/mongoose-schema')
  , Query    = null;

function queryName (name, expression) {
    if (name) {
        return name;
    } else if (expression && expression.match(/^\(/) && expression.match(/\)$/)) {
        return expression.substr(1, expression.length - 2);
    } else {
        return expression;
    }
}

Query = schema.create({
    _id         : { type: String }
  , userId      : { type: Types.ObjectId, ref: 'User', required: true }
  , name        : { type: String, required: true }
  , resultCount : { type: Number, required: true, default: 0 }
  , expression  : { type: String, required: true }
  , private     : { type: Boolean, required: true, default: false }
  , notes       : { type: String }
}, null, true);

Query.pre('save', function (next) {
    if (this.isNew) {
        this.set('_id', md5.create(this.get('userId'), this.get('expression')));
        this.set('name', queryName(this.get('name'), this.get('expression')));
    }
    next();
});

Query.statics.upsert = function (data, cb) {
    var criteria = { _id: md5.create(data.userId, data.expression) }
      , options  = { upsert: true, multi: false, strict: true };

    data.updatedAt = Date.now();
    data.name = queryName(data.name, data.expression);
    data.$setOnInsert = { createdAt: Date.now() };

    this.update(criteria, data, options, cb);
};

Query.statics.delete = function (data, cb) {
    this.find({ _id: md5.create(data.userId, data.expression) }).remove(cb);
};

module.exports = mongoose.model('Query', Query);
