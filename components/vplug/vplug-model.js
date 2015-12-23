const mongoose = require('mongoose'),
      schema = require('../core/mongoose-schema');

/*
 * Model that represents a vim plugin
 */
const Vplug = schema.create({
  author: { type: Object },
  description: { type: String },
  doc: { type: Object },
  githubCloneUrl: { type: String },
  githubCreatedAt: { type: Date },
  githubHtmlUrl: { type: String, index: { unique: true, sparse: true } },
  githubPushedAt: { type: Date },     // date and time of the last commit
  githubSshUrl: { type: String },
  githubStarCount: { type: Number },
  githubUpdatedAt: { type: Date },     // date and time of the last change
  hasDoc: { type: Boolean, default: false },
  hasReadme: { type: Boolean, default: false },
  isPlugin: { type: Number, default: 0 },
  name: { type: String },
  readme: { type: Object },
  tags: { type: [String], index: true },
  vimorgUrl: { type: String, index: { unique: true, sparse: true } }
});

Vplug.index({
  'author.name': 'text',
  'author.login': 'text',
  'description': 'text',
  'githubHtmlUrl': 'text',
  'name': 'text',
  'tags': 'text'
});

Vplug.pre('save', function preVplugSave(next) {
  this.set('hasDoc', Boolean((this.get('doc') || {}).content));
  this.set('hasReadme', Boolean((this.get('readme') || {}).content));
  next();
});

module.exports = mongoose.model('Vplug', Vplug);
