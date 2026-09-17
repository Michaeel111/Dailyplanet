const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendAlertEmail(to, city, condition, description) {
  await resend.emails.send({
    from: 'Daily Planet <onboarding@resend.dev>',
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

async function sendResetEmail(to, resetLink) {
  await resend.emails.send({
    from: 'Daily Planet <onboarding@resend.dev>',
    to,
    subject: 'Reset your Daily Planet password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your Daily Planet password.</p>
      <p>This link expires in 15 minutes.</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
      `
    
  });
}

module.exports = {
  sendAlertEmail,
  sendResetEmail
};