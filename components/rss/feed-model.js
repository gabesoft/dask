'use strict';

const mongoose = require('mongoose'),
      schema = require('../core/mongoose-schema');

/**
 * Blog feed object schema
 */
const Feed = schema.create({
  author: { type: String },
  data: { type: Object }, // last modified
  date: { type: Date },
  description: { type: String },
  failedAttempts: { type: Number, default: 0 },
  favicon: { type: String },
  format: { type: Object },
  generator: { type: String },
  guid: { type: String },
  image: { type: Object },
  language: { type: String },
  lastPostDate: { type: Date },
  lastReadDate: { type: Date },
  lastReadStatus: { type: Object },
  link: { type: String },
  postCount: { type: Number, required: true, default: 0 },
  title: { type: String },
  uri: { type: String, required: true, index: { unique: true } }
});

Feed.index({
  author: 'text',
  description: 'text',
  link: 'text',
  title: 'text',
  uri: 'text',
  userTitle: 'text',
  default_language: 'en',
  language_override: 'en'
});

module.exports = mongoose.model('Feed', Feed);
