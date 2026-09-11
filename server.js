require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => res.send('Daily Planet API running'));

const pool = require('./config/db');

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const requireAuth = require('./middleware/auth');

app.get('/api/me', requireAuth, async (req, res) => {
  const [users] = await pool.query('SELECT is_premium FROM users WHERE id = ?', [req.user.userId]);
  res.json({ message: 'You are authenticated!', user: { ...req.user, isPremium: !!users[0]?.is_premium } });
});
const favoritesRoutes = require('./routes/favorites');
app.use('/api/favorites', favoritesRoutes);
const weatherRoutes = require('./routes/weather');
app.use('/api/weather', weatherRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);

const sendAlertEmail = require('./utils/mailer');

const cron = require('node-cron');
const checkWeatherAlerts = require('./utils/alertChecker');

// Runs every day at 7:00 AM server time
cron.schedule('0 7 * * *', () => {
  checkWeatherAlerts();
});
