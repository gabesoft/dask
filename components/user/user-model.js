'use strict';

function transform (doc, ret, options) {
    delete ret._id;
    delete ret.__v;
    return ret;
}

var mongoose   = require('mongoose')
  , Schema     = mongoose.Schema
  , userSchema = new Schema({
        email     : { type: String, required: true, index : { unique: true } }
      , password  : { type: String, required: true }
      , createdAt : { type: Date, default : Date.now }
      , firstName : String
      , lastName  : String
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

module.exports = mongoose.model('User', userSchema);
