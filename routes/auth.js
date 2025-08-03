const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: get next UID
async function getNextUid() {
  const lastUser = await User.findOne().sort({ uid: -1 }).exec();
  return lastUser ? lastUser.uid + 1 : 1;
}

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'Username already taken' });

    user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Email already registered' });

    const uid = await getNextUid();
    const passwordHash = await bcrypt.hash(password, 10);

    user = new User({ uid, username, email, passwordHash });
    await user.save();

    const payload = { user: { id: user.id, uid: user.uid, username: user.username } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, uid: user.uid, username: user.username });
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    if (user.isBanned) return res.status(403).json({ msg: 'User is banned' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id, uid: user.uid, username: user.username } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, uid: user.uid, username: user.username });
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
