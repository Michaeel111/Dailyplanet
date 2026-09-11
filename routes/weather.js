const express = require('express');
const axios = require('axios');
const pool = require('../config/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const CACHE_MINUTES = 10;

router.get('/:city', async (req, res) => {
  const city = req.params.city;
  // EXTENDED FORECAST (premium only)
router.get('/:city/forecast', requireAuth, async (req, res) => {
  const city = req.params.city;

  try {
    // Check if user is premium
    const [users] = await pool.query('SELECT is_premium FROM users WHERE id = ?', [req.user.userId]);
    if (!users[0] || !users[0].is_premium) {
      return res.status(403).json({ error: 'This feature requires a premium subscription' });
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        q: city,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    res.json({ data: response.data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Could not fetch forecast data' });
  }
});

module.exports = router;

  try {
    // 1. Check the cache first
    const [cached] = await pool.query(
      'SELECT * FROM weather_cache WHERE city_name = ?',
      [city]
    );

    if (cached.length > 0) {
      const ageMinutes = (Date.now() - new Date(cached[0].fetched_at)) / 60000;
      if (ageMinutes < CACHE_MINUTES) {
        return res.json({ source: 'cache', data: JSON.parse(cached[0].weather_data) });
      }
    }

    // 2. Not cached (or stale) — call OpenWeatherMap
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    const weatherData = response.data;

    // 3. Save/update the cache
    await pool.query(
      `INSERT INTO weather_cache (city_name, weather_data, fetched_at)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE weather_data = ?, fetched_at = NOW()`,
      [city, JSON.stringify(weatherData), JSON.stringify(weatherData)]
    );

    res.json({ source: 'live', data: weatherData });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Could not fetch weather data' });
  }
});

module.exports = router;
