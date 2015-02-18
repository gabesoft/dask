'use strict';

var mongoose  = require('mongoose')
  , timestamp = require('../core/mongoose-plugins/timestamp')
  , crypto    = require('crypto')
  , Schema    = mongoose.Schema
  , Url       = null;

function transform (doc, ret, options) {
    delete ret._id;
    delete ret.__v;
    return ret;
}

function hash (url) {
    var userId = url.get('userId')
      , href   = url.get('href');
    return crypto.createHash('md5').update(userId + href).digest('hex');
}

Url = new Schema({
    _id         : { type: String }
  , userId      : { type: Schema.Types.ObjectId, ref: 'User', required: true }
  , href        : { type: String, required: true }
  , userEntered : { type: String, required: true }
  , favicon     : { type: String, required: true }
  , title       : { type: String}
  , clickCount  : { type: Number, required: true, default: 0 }
  , rank        : { type: Number }
  , notes       : { type: String }
  , tags        : { type: [String], index: true }
  , private     : { type: Boolean, required: true, default: false }
}, {
    autoIndex : true
  , id        : true
  , _id       : true
  , strict    : true
  , toObject  : {
        virtuals  : true
      , getters   : true
      , minimize  : true
      , transform : transform
    }
});

Url.index({ title: 'text', href: 'text', notes: 'text' });

Url.pre('save', function (next) {
    if (this.isNew) {
        this.set('_id', hash(this));
    }

    var tags = this.get('tags') || []
      , uniq = {};

    tags.forEach(function (tag) {
        uniq[tag.toLowerCase()] = tag;
    });

    this.set('tags', Object.keys(uniq).sort());

    next();
});

Url.plugin(timestamp);

module.exports = mongoose.model('Url', Url);
