const webpush = require('web-push');
const PushSubscription = require('../models/pushSubscription');

webpush.setVapidDetails(
  `mailto:${process.env.ADMIN_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendPushToAll(title, body) {
  const subscriptions = await PushSubscription.findAll();
  const payload = JSON.stringify({ title, body });

  for (const subscription of subscriptions) {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, payload);
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await subscription.destroy();
      } else {
        console.error(`Failed to send push to subscription ${subscription.id}:`, err.message);
      }
    }
  }
}

module.exports = { sendPushToAll };
