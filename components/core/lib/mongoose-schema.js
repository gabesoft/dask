'use strict';

const mongoose = require('mongoose'),
      timestamp = require('../mongoose-plugins/timestamp'),
      Schema = mongoose.Schema,
      extend = require('util')._extend,
      transform = function schemaTransform(doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
      defaults = {
        autoIndex: true,
        id: true,
        _id: true,
        strict: true,
        toObject: {
          virtuals: true,
          getters: true,
          minimize: true,
          transform: transform
        }
      };

module.exports.create = (fields, options, addTimestamp) => {
  const model = new Schema(fields, extend(extend({}, defaults), options));

  if (addTimestamp) {
    model.plugin(timestamp);
  }

  if ('tags' in fields) {
    model.pre('save', function preModelSave(next) {
      const tags = this.get('tags') || [],
            uniq = {};

      tags.forEach(tag => {
        uniq[tag.toLowerCase()] = tag;
      });

      this.set('tags', Object.keys(uniq).sort());

      next();
    });
  }

  return model;
};
