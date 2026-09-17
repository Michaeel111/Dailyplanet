const express = require('express');
const axios = require('axios');
const pool = require('../config/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// INITIALIZE a payment
router.post('/initialize', requireAuth, async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email,
        amount: 500000, // amount in kobo — this is ₦5,000
        callback_url: 'https://dailyplanet-production.up.railway.app/premium-success.html'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    res.json(response.data.data); // contains authorization_url + reference
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Could not start payment' });
  }
});

// VERIFY a payment
router.get('/verify/:reference', requireAuth, async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const status = response.data.data.status;

    if (status === 'success') {
      await pool.query('UPDATE users SET is_premium = 1 WHERE id = ?', [req.user.userId]);
      return res.json({ success: true, message: 'Payment verified — you are now premium!' });
    }

    res.status(400).json({ success: false, message: 'Payment not successful' });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Could not verify payment' });
  }
});

module.exports = router;