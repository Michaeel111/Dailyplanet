const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendResetEmail } = require('../utils/mailer');

const router = express.Router();

// SIGNUP
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );

    res.status(201).json({ id: result.insertId, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, isPremium: user.is_premium } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// FORGOT PASSWORD — request a reset link
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = jwt.sign(
      { userId: user.id, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const resetLink = `dailyplanet-production.up.railway.app/reset-password.html?token=${resetToken}`;

    await sendResetEmail(email,resetLink);
    ({
      from: `"Daily Planet Weather" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your Daily Planet password',
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `
    });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not process request' });
  }
});

// RESET PASSWORD — using the token from the email link
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, decoded.userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Reset link is invalid or expired' });
  }
});

module.exports = router;