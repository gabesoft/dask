'use strict';

const mongoose = require('mongoose'),
      schema = require('../core/lib/mongoose-schema');

const User = schema.create({
  disabled: { type: Boolean, required: true, default: false },
  email: { type: String, required: true },
  meta: { type: Object },
  password: { type: String, required: true },
  type: { type: String, required: true, default: 'ayne' }
}, null, true);

User.index({ email: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('User', User);
