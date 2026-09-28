const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

async function sendViaBrevo({ senderName, to, subject, textContent, htmlContent }) {
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: senderName, email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brevo API request failed (${response.status}): ${body}`);
  }
}

async function sendDigestEmail(digestText, digestHtml, dateLabel) {
  await sendViaBrevo({
    senderName: 'Tourist Admin Digest',
    to: process.env.ADMIN_EMAIL,
    subject: `Daily Booking Digest - ${dateLabel}`,
    textContent: digestText,
    htmlContent: digestHtml,
  });
}

async function sendVerificationEmail(toEmail, name, verifyLink) {
  await sendViaBrevo({
    senderName: 'Tourist Admin',
    to: toEmail,
    subject: 'Verify your Tourist account',
    textContent: `Hi ${name},\n\nClick the link below to verify your account:\n${verifyLink}\n\nThis link expires in 24 hours.`,
    htmlContent: `
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
