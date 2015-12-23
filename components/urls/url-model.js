const mongoose = require('mongoose'),
      md5 = require('../core/md5-hash'),
      schema = require('../core/mongoose-schema'),
      Types = mongoose.Schema.Types;

const Url = schema.create({
  _id: { type: String },
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  href: { type: String, required: true },
  userEntered: { type: String, required: true },
  favicon: { type: String, required: true },
  title: { type: String },
  clickCount: { type: Number, required: true, default: 0 },
  rank: { type: Number },
  notes: { type: String },
  tags: { type: [String], index: true },
  private: { type: Boolean, required: true, default: false }
}, null, true);

Url.index({ title: 'text', href: 'text', notes: 'text' });

Url.pre('save', function preUrlSave(next) {
  if (this.isNew) {
    this.set('_id', md5.create(this.get('userId'), this.get('href')));
  }

  next();
});

module.exports = mongoose.model('Url', Url);
