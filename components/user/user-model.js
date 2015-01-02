'use strict';

var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;

function transform (doc, ret, options) {
    delete ret._id;
    delete ret.__v;
    return ret;
}

module.exports = mongoose.model('User', new Schema({
    email     : { type: String, required: true, index : { unique: true } }
  , password  : { type: String, required: true }
  , createdAt : { type: Date, default : Date.now }
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
