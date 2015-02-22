'use strict';

var mongoose  = require('mongoose')
  , timestamp = require('../mongoose-plugins/timestamp')
  , Schema    = mongoose.Schema
  , extend    = require('util')._extend
  , transform = function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
  , defaults = {
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
    };

module.exports.create = function (fields, options, addTimestamp) {
    var model = new Schema(fields, extend(extend({}, defaults), options));
    if (addTimestamp) {
        model.plugin(timestamp);
    }
    return model;
};
