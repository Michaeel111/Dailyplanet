const axios = require('axios');
const pool = require('../config/db');
const sendAlertEmail = require('./mailer');

const ALERT_CONDITIONS = ['Thunderstorm', 'Snow', 'Tornado', 'Squall'];

async function checkWeatherAlerts() {
  console.log('Running weather alert check...');

  try {
    // Get all premium users along with their favorite cities
    const [rows] = await pool.query(`
      SELECT u.email, f.city_name
      FROM users u
      JOIN favorites f ON f.user_id = u.id
      WHERE u.is_premium = 1
    `);

    for (const row of rows) {
      try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            q: row.city_name,
            appid: process.env.OPENWEATHER_API_KEY,
            units: 'metric'
          }
        });

        const condition = response.data.weather[0].main;
        const description = response.data.weather[0].description;

        if (ALERT_CONDITIONS.includes(condition)) {
          await sendAlertEmail(row.email, row.city_name, condition, description);
          console.log(`Alert sent to ${row.email} for ${row.city_name}`);
        }
      } catch (err) {
        console.error(`Failed checking ${row.city_name} for ${row.email}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Alert check failed:', err.message);
  }
}

module.exports = checkWeatherAlerts;