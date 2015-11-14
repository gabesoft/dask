'use strict';

const mongoose = require('mongoose'),
      schema = require('../core/lib/mongoose-schema');

/**
 * Blog feed object schema
 */
const Feed = schema.create({
  author: { type: String },
  data: { type: Object },
  date: { type: Date },
  description: { type: String },
  favicon: { type: String },
  generator: { type: String },
  image: { type: Object },
  language: { type: String },
  link: { type: String, required: true, index: { unique: true } },
  tags: { type: [String], index: true },
  title: { type: String },
  uri: { type: String, required: true, index: { unique: true } },
  userTitle: { type: String }
});

Feed.index({
  author: 'text',
  description: 'text',
  link: 'text',
  title: 'text',
  uri: 'text',
  userTitle: 'text'
});

module.exports = mongoose.model('Feed', Feed);
