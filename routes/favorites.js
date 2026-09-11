const express = require('express');
const pool = require('../config/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ADD a favorite city
router.post('/', requireAuth, async (req, res) => {
  const { cityName, countryCode } = req.body;
  const userId = req.user.userId;

  if (!cityName) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND city_name = ?',
      [userId, cityName]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'City already saved' });
    }

    const [result] = await pool.query(
      'INSERT INTO favorites (user_id, city_name, country_code) VALUES (?, ?, ?)',
      [userId, cityName, countryCode || null]
    );
    res.status(201).json({ id: result.insertId, cityName, countryCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save favorite' });
  }
});

// LIST this user's favorites
router.get('/', requireAuth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM favorites WHERE user_id = ?',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch favorites' });
  }
});

// DELETE a favorite
router.delete('/:id', requireAuth, async (req, res) => {
  const userId = req.user.userId;
  const favoriteId = req.params.id;

  try {
    const [result] = await pool.query(
      'DELETE FROM favorites WHERE id = ? AND user_id = ?',
      [favoriteId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }
    res.json({ message: 'Favorite removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete favorite' });
  }
});

module.exports = router;