'use strict';

const mongoose = require('mongoose'),
      Types = mongoose.Schema.Types,
      schema = require('../core/mongoose-schema');

const FeedSubscription = schema.create({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  feedId: { type: Types.ObjectId, ref: 'Feed', required: true },
  title: { type: String },
  tags: { type: [String], index: true },
  notes: { type: String },
  disabled: { type: Boolean, required: true, default: false }
}, null, true);

FeedSubscription.index({ userId: 1, feedId: 1 }, { unique: true });

module.exports = mongoose.model('FeedSubscription', FeedSubscription);
