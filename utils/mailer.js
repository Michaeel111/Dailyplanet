const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendAlertEmail(to, city, condition, description) {
  await transporter.sendMail({
    from: `"Daily Planet Weather" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⚠️ Weather Alert: ${condition} in ${city}`,
    html: `
      <h2>Weather Alert for ${city}</h2>
      <p>${description}</p>
      <p>Stay safe!</p>
      <p style="color:#888;font-size:12px;">— Daily Planet</p>
    `
  });
}

module.exports = sendAlertEmail;
module.exports.transporter = transporter;