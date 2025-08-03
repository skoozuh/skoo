const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `user_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Get profile info
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update profile text fields
router.put('/', auth, async (req, res) => {
  const { bio, socialLinks, musicEmbedUrl, cursorUrl } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.bio = bio || user.bio;
    user.socialLinks = socialLinks || user.socialLinks;
    user.musicEmbedUrl = musicEmbedUrl || user.musicEmbedUrl;
    user.cursorUrl = cursorUrl || user.cursorUrl;

    await user.save();
    res.json({ msg: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Upload PFP
router.post('/upload-pfp', auth, upload.single('pfp'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.pfpUrl = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ msg: 'Profile picture updated', pfpUrl: user.pfpUrl });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Upload Background
router.post('/upload-background', auth, upload.single('background'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.backgroundUrl = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ msg: 'Background updated', backgroundUrl: user.backgroundUrl });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
