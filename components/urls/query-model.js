'use strict';

var mongoose  = require('mongoose')
  , md5       = require('../core/lib/md5-hash')
  , timestamp = require('../core/mongoose-plugins/timestamp')
  , Types     = mongoose.Schema.Types
  , schema    = require('../core/lib/mongoose-schema')
  , Query     = null;

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
        this.set('name', this.get('name') || this.get('expression'));
    }
    next();
});

Query.statics.upsert = function (data, cb) {
    var criteria = { _id: md5.create(data.userId, data.expression) }
      , options  = { upsert: true, multi: false, strict: true };
    data.updatedAt = Date.now();
    data.$setOnInsert = { createdAt: Date.now() };
    this.update(criteria, data, options, cb);
};

module.exports = mongoose.model('Query', Query);
