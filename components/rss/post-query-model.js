'use strict';

const mongoose = require('mongoose'),
      Types = mongoose.Schema.Types,
      schema = require('../core/mongoose-schema');

/**
 * Post query schema
 */
const PostQuery = schema.create({
  _id: { type: String, required: true },
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  title: { type: String },
  ast: { type: Object, required: true },
  data: { type: Object },
  dataJSON: { type: String, required: true },
  text: { type: String, required: true },
  pin: { type: Number, required: true, default: 0 }
}, null, true);

PostQuery.index({ userId: 1, text: 1 }, { unique: true });

module.exports = mongoose.model('PostQuery', PostQuery);
