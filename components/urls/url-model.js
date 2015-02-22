'use strict';

var mongoose = require('mongoose')
  , md5      = require('../core/lib/md5-hash')
  , Types    = mongoose.Schema.Types
  , schema   = require('../core/lib/mongoose-schema')
  , Url      = null;

Url = schema.create({
    _id         : { type: String }
  , userId      : { type: Types.ObjectId, ref: 'User', required: true }
  , href        : { type: String, required: true }
  , userEntered : { type: String, required: true }
  , favicon     : { type: String, required: true }
  , title       : { type: String}
  , clickCount  : { type: Number, required: true, default: 0 }
  , rank        : { type: Number }
  , notes       : { type: String }
  , tags        : { type: [String], index: true }
  , private     : { type: Boolean, required: true, default: false }
}, null, true);

Url.index({ title: 'text', href: 'text', notes: 'text' });

Url.pre('save', function (next) {
    if (this.isNew) {
        this.set('_id', md5.create(this.get('userId'), this.get('href')));
    }

    var tags = this.get('tags') || []
      , uniq = {};

    tags.forEach(function (tag) {
        uniq[tag.toLowerCase()] = tag;
    });

    this.set('tags', Object.keys(uniq).sort());

    next();
});

module.exports = mongoose.model('Url', Url);
