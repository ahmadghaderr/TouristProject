const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendDigestEmail(digestText, digestHtml, dateLabel) {
  await transporter.sendMail({
    from: `"Tourist Admin Digest" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `Daily Booking Digest - ${dateLabel}`,
    text: digestText,
    html: digestHtml,
  });
}

async function sendVerificationEmail(toEmail, name, verifyLink) {
  await transporter.sendMail({
    from: `"Tourist Admin" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your Tourist account',
    text: `Hi ${name},\n\nClick the link below to verify your account:\n${verifyLink}\n\nThis link expires in 24 hours.`,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 15px; color:#222;">
        <p>Hi ${name},</p>
        <p>Click the button below to verify your account and get access.</p>
        <p><a href="${verifyLink}" style="display:inline-block; padding:12px 20px; background:#C9A24B; color:#15181B; text-decoration:none; border-radius:4px; font-weight:600;">Verify Account</a></p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  });
}

module.exports = { sendDigestEmail, sendVerificationEmail };