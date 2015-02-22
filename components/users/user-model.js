'use strict';

var mongoose  = require('mongoose')
  , schema    = require('../core/lib/mongoose-schema')
  , User      = null;

User = schema.create({
    email    : { type: String, required: true, index : { unique: true } }
  , password : { type: String, required: true }
  , disabled : { type: Boolean, required: true, default: false }
}, null, true);

module.exports = mongoose.model('User', User);
