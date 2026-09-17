const cron = require('node-cron');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const Visit = require('../models/visit');
const { sendPushToAll } = require('../services/webPushService');

// How far ahead of arrival/departure to send the reminder.
const REMINDER_LEAD_TIME_MS = 12 * 60 * 60 * 1000; // 12 hours

// Must stay in sync with the cron interval in schedulePreArrivalNotifications() below -
// this is the width of the "catch" window each run sweeps, so every visit is
// picked up by exactly one run as it crosses the lead-time threshold.
const CHECK_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

async function checkAndSendReminders() {
  const now = moment.tz('Asia/Beirut');
  const windowStart = now.clone().add(REMINDER_LEAD_TIME_MS, 'milliseconds').toDate();
  const windowEnd = new Date(windowStart.getTime() + CHECK_WINDOW_MS);

  const arrivals = await Visit.findAll({
    where: {
      dateFrom: { [Op.gte]: windowStart, [Op.lt]: windowEnd },
      arrivalReminderSent: false,
    },
  });

  const departures = await Visit.findAll({
    where: {
      dateTo: { [Op.gte]: windowStart, [Op.lt]: windowEnd },
      departureReminderSent: false,
    },
  });

  for (const visit of arrivals) {
    try {
      await sendPushToAll(
        'Arrival in 12 hours',
        `${visit.name} arrives at ${visit.hotel} (${visit.car}) in 12 hours.`
      );
      visit.arrivalReminderSent = true;
      await visit.save();
    } catch (err) {
      console.error(`Failed to send arrival reminder for visit ${visit.id}:`, err.message);
    }
  }

  for (const visit of departures) {
    try {
      await sendPushToAll(
        'Departure in 12 hours',
        `${visit.name} departs from ${visit.hotel} (${visit.car}) in 12 hours.`
      );
      visit.departureReminderSent = true;
      await visit.save();
    } catch (err) {
      console.error(`Failed to send departure reminder for visit ${visit.id}:`, err.message);
    }
  }

  return { arrivalsNotified: arrivals.length, departuresNotified: departures.length };
}

function schedulePreArrivalNotifications() {
  cron.schedule('*/15 * * * *', () => {
    checkAndSendReminders().catch((err) => console.error('Reminder check failed:', err.message));
  }, { timezone: 'Asia/Beirut' });
  console.log('Pre-arrival/departure reminder job scheduled every 15 minutes (Asia/Beirut)');
}

module.exports = { checkAndSendReminders, schedulePreArrivalNotifications };
