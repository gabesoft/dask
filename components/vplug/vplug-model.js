'use strict';

var mongoose = require('mongoose')
  , Types    = mongoose.Schema.Types
  , schema   = require('../core/lib/mongoose-schema')
  , Vplug    = null;

/*
 * Model that represents a vim plugin
 */
Vplug = schema.create({
    name            : String
  , author          : String
  , githubUrl       : { type: String, index: { unique: true, sparse: true } }
  , githubStarCount : Number
  , vimorgUrl       : { type: String, index: { unique: true, sparse: true } }
  , tags            : { type: [String], index: true }
  , description     : String
});

module.exports = mongoose.model('Vplug', Vplug);
