const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  uid: { type: Number, unique: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  bio: { type: String, default: '' },
  pfpUrl: { type: String, default: '' },
  backgroundUrl: { type: String, default: '' },
  cursorUrl: { type: String, default: '' },
  musicEmbedUrl: { type: String, default: '' },
  socialLinks: { type: [String], default: [] },
  badges: { type: [String], default: [] },
  isBanned: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', UserSchema);
