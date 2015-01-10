'use strict';

var mongoose  = require('mongoose')
  , timestamp = require('../core/mongoose-plugins/timestamp')
  , Schema    = mongoose.Schema
  , User      = null;

function transform (doc, ret, options) {
    delete ret._id;
    delete ret.__v;
    return ret;
}

User = new Schema({
    email    : { type: String, required: true, index : { unique: true } }
  , password : { type: String, required: true }
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

User.plugin(timestamp);

module.exports = mongoose.model('User', User);
