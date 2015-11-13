'use strict';

const mongoose = require('mongoose'),
      Types = mongoose.Schema.Types,
      schema = require('../core/lib/mongoose-schema');

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
  tags: { type: [String], index: true },
  title: { type: String }
});

module.exports = mongoose.model('Post', Post);
