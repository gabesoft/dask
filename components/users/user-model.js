'use strict';

const mongoose = require('mongoose'),
      schema = require('../core/lib/mongoose-schema');

const User = schema.create({
  disabled: { type: Boolean, required: true, default: false },
  admin: { type: Boolean, required: true, default: false },
  email: { type: String, required: true },
  meta: { type: Object },
  password: { type: String },
  type: { type: String, required: true }
}, null, true);

User.index({ email: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('User', User);
