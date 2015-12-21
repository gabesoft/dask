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
          transform
        }
      };

module.exports.create = (fields, options, addTimestamp) => {
  const schema = new Schema(fields, extend(extend({}, defaults), options));

  if (addTimestamp) {
    schema.plugin(timestamp);
  }

  if ('tags' in fields) {
    schema.pre('save', function preModelSave(next) {
      const tags = this.get('tags') || [],
            uniq = {};

      tags.forEach(tag => {
        uniq[tag.toLowerCase()] = tag;
      });

      this.set('tags', Object.keys(uniq).sort());

      next();
    });
  }

  schema.getPaths = (exclude) => {
    exclude = exclude || [];
    const paths = [];

    schema.eachPath(path => {
      if (exclude.indexOf(path) === -1) {
        paths.push(path);
      }
    });

    return paths;
  };

  return schema;
};
