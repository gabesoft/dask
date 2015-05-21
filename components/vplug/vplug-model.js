'use strict';

var mongoose = require('mongoose')
  , schema   = require('../core/lib/mongoose-schema')
  , Vplug    = null;

/*
 * Model that represents a vim plugin
 */
Vplug = schema.create({
    author          : { type : Object }
  , description     : { type : String }
  , githubStarCount : { type : Number }
  , githubUrl       : { type : String, index: { unique: true, sparse: true } }
  , name            : { type : String }
  , tags            : { type : [String], index: true }
  , vimorgUrl       : { type : String, index: { unique: true, sparse: true } }
  , readme          : { type : Object }
  , doc             : { type : Object }
  , isPlugin        : { type : Boolean, default : false  }
});

Vplug.index({
      author      : 'text'
    , description : 'text'
    , githubUrl   : 'text'
    , name        : 'text'
    , tags        : 'text'
});

Vplug.pre('save', function (next) {
    this.set('isPlugin', Boolean((this.get('doc') || {}).content));
    next();
});

module.exports = mongoose.model('Vplug', Vplug);
