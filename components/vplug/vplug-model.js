'use strict';

var mongoose = require('mongoose')
  , Types    = mongoose.Schema.Types
  , schema   = require('../core/lib/mongoose-schema')
  , Vplug    = null;

/*
 * Model that represents a vim plugin
 */
Vplug = schema.create({
    author          : { type : String }
  , description     : { type : String }
  , githubStarCount : { type : Number }
  , githubUrl       : { type : String, index: { unique: true, sparse: true } }
  , name            : { type : String }
  , tags            : { type : [String], index: true }
  , vimorgUrl       : { type : String, index: { unique: true, sparse: true } }
});

Vplug.index({
      author      : 'text'
    , description : 'text'
    , githubUrl   : 'text'
    , name        : 'text'
    , tags        : 'text'
});

module.exports = mongoose.model('Vplug', Vplug);
