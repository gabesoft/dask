'use strict';

const mongoose = require('mongoose'),
      Types = mongoose.Schema.Types,
      schema = require('../core/lib/mongoose-schema');

/**
 * Blog post object schema
 */
const Post = schema.create({
  feedId: { type: Types.ObjectId, ref: 'Feed', required: true },
  title: { type: String },
  description: { type: String },
  summary: { type: String },
  comments: { type: String },
  guid: { type: String, required: true, index: { unique: true } },
  link: { type: String, required: true, index: { unique: true } },
  author: { type: String },
  source: { type: String },
  date: { type: Date },
  pubdate: { type: Date },
  image: { type: Object },
  tags: { type: [String], index: true }
});

module.exports = mongoose.model('Post', Post);
