'use strict';

var mongoose = require('mongoose')
  , Types    = mongoose.Schema.Types
  , schema   = require('../core/lib/mongoose-schema')
  , Profile  = null;

function username () {
    var pat1 = Math.random().toString(36).slice(2)
      , pat2 = Date.now().toString(36);
    return 'temp-display-name-' + pat1 + pat2;
}

Profile = schema.create({
    displayName   : {
        type     : String
      , required : true
      , default  : username
      , index    : { unique : true }
    }
  , userId        : { type: Types.ObjectId, ref: 'User', required: true }
  , gravatarEmail : String
  , firstName     : String
  , lastName      : String
  , location      : String
}, null, true);

module.exports = mongoose.model('Profile', Profile);
