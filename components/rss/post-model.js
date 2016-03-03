'use strict';

const mongoose = require('mongoose'),
      Types = mongoose.Schema.Types,
      schema = require('../core/mongoose-schema');

/**
 * Blog post object schema
 */
const Post = schema.create({
  author: { type: String },
  comments: { type: String },
  date: { type: Date },
  description: { type: String },
  feedId: { type: Types.ObjectId, ref: 'Feed', required: true },
  guid: { type: String, required: true, index: { unique: true } },
  image: { type: Object },
  link: { type: String, required: true, index: { unique: true } },
  pubdate: { type: Date },
  source: { type: Object },
  summary: { type: String },
  title: { type: String }
});

Post.index({
  author: 'text',
  description: 'text',
  link: 'text',
  summary: 'text',
  title: 'text',
  default_language: 'en',
  language_override: 'en'
});

module.exports = mongoose.model('Post', Post);
