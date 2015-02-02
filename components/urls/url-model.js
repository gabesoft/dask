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

function hash (text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

Url = new Schema({
    _id     : { type: String }
  , userId  : { type: Schema.Types.ObjectId, ref: 'User', required: true }
  , href    : { type: String, required: true }
  , title   : { type: String}
  , rank    : { type: Number }
  , notes   : { type: String }
  , tags    : { type: [String], index: true }
  , private : { type: Boolean, required: true, default: false }
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

Url.pre('save', function (next) {
    if (this.isNew) {
        this.set('_id', this.get('userId') + hash(this.get('href')));
    }
    next();
});

Url.plugin(timestamp);

module.exports = mongoose.model('Url', Url);
