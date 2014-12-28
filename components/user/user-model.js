'use strict';

function now () {
    return (Date.now() / 1000) >>> 0;
}

function transform (doc, ret, options) {
    delete ret._id;
    return ret;
}

var mongoose   = require('mongoose')
  , userSchema = mongoose.Schema({
        email        : { type: String, required: true, index : { unique: true } }
      , salt         : { type: String, required: true }
      , passwordHash : { type: String, required: true }
      , createdAt    : { type: Date, default : now }
      , firstName    : String
      , lastName     : String
    }, {
        autoIndex : true
      , id        : true
      , _id       : false
      , strict    : true
      , toObject  : {
            virtuals  : true
          , getters   : true
          , minimize  : true
          , transform : transform
        }
    });

module.exports = mongoose.model('User', userSchema);
