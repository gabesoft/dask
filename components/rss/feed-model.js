'use strict';

const mongoose = require('mongoose'),
      schema = require('../core/lib/mongoose-schema');

/**
 * Blog feed object schema
 */
const Feed = schema.create({
  title: { type: String },
  description: { type: String },
  uri: { type: String, required: true, index: { unique: true } },
  link: { type: String, required: true, index: { unique: true } },
  author: { type: String },
  language: { type: String },
  date: { type: Date },
  image: { type: Object },
  data: { type: Object },
  favicon: { type: String },
  tags: { type: [String], index: true }
});

module.exports = mongoose.model('Feed', Feed);
