const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Middleware to verify admin role
const adminAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: 'Unauthorized' });
  User.findById(req.user.id).then(user => {
    if (!user || !user.isAdmin) return res.status(403).json({ msg: 'Admin access required' });
    next();
  });
};

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Ban/unban user
router.put('/ban/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({ msg: user.isBanned ? 'User banned' : 'User unbanned' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add/remove badges
router.put('/badge/:id', auth, adminAuth, async (req, res) => {
  const { badge } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user.badges.includes(badge)) {
      user.badges = user.badges.filter(b => b !== badge);
      await user.save();
      return res.json({ msg: 'Badge removed' });
    } else {
      user.badges.push(badge);
      await user.save();
      return res.json({ msg: 'Badge added' });
    }
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
