'use strict';

var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;

function transform (doc, ret, options) {
    delete ret._id;
    delete ret.__v;
    return ret;
}

function username () {
    var pat1 = Math.random().toString(36).slice(2)
      , pat2 = Date.now().toString(36);
    return 'user' + pat1 + pat2;
}

module.exports = mongoose.model('Profile', new Schema({
    displayName   : {
        type     : String
      , required : true
      , default  : username
      , index    : { unique : true }
    }
  , userId        : { type: Schema.Types.ObjectId, ref: 'User' }
  , gravatarEmail : String
  , firstName     : String
  , lastName      : String
  , location      : String
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
}));
