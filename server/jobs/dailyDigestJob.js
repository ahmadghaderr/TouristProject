const cron = require('node-cron');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const Visit = require('../models/visit');
const { generateAiSummary } = require('../services/digestService');
const { sendDigestEmail } = require('../services/emailService');

async function buildDigestData() {
  const startOfDay = moment.tz('Asia/Beirut').startOf('day').toDate();
  const endOfDay = moment.tz('Asia/Beirut').endOf('day').toDate();

  const arrivals = await Visit.findAll({
    where: { dateFrom: { [Op.between]: [startOfDay, endOfDay] } },
    order: [['dateFrom', 'ASC']],
  });

  const departures = await Visit.findAll({
    where: { dateTo: { [Op.between]: [startOfDay, endOfDay] } },
    order: [['dateTo', 'ASC']],
  });

  const fullDayActive = await Visit.findAll({
    where: {
      type: { [Op.in]: ['full-days', 'mixed'] },
      dateFrom: { [Op.lt]: startOfDay },
      dateTo: { [Op.gt]: endOfDay },
    },
    order: [['name', 'ASC']],
  });

  return { arrivals, departures, fullDayActive };
}

function formatArrival(v) {
  const time = moment(v.dateFrom).tz('Asia/Beirut').format('h:mm A');
  const price = v.arrivalPrice ?? v.totalCost ?? 0;
  return `${v.name} — ${time} — ${v.car} — ${v.hotel} — $${price}`;
}

function formatDeparture(v) {
  const time = moment(v.dateTo).tz('Asia/Beirut').format('h:mm A');
  const price = v.departurePrice ?? v.totalCost ?? 0;
  return `${v.name} — ${time} — ${v.car} — ${v.hotel} — $${price}`;
}

function formatFullDay(v) {
  const price = v.pricePerDay ?? v.totalCost ?? 0;
  return `${v.name} — $${price} — ${v.car}`;
}

function buildDigestText({ arrivals, departures, fullDayActive, aiSummary }) {
  const lines = [];

  if (aiSummary) {
    lines.push('SUMMARY:');
    lines.push(aiSummary);
    lines.push('');
  }

  lines.push('ARRIVED:');
  lines.push(arrivals.length ? arrivals.map(formatArrival).join('\n') : 'None scheduled');

  lines.push('');
  lines.push('DEPARTURE:');
  lines.push(departures.length ? departures.map(formatDeparture).join('\n') : 'None scheduled');

  lines.push('');
  lines.push('FULL-DAY:');
  lines.push(fullDayActive.length ? fullDayActive.map(formatFullDay).join('\n') : 'None active');

  return lines.join('\n');
}

function buildDigestHtml({ arrivals, departures, fullDayActive, aiSummary }) {
  const section = (title, items, formatter) => `
    <h3 style="color:#00796b; margin-bottom:6px;">${title}</h3>
    ${
      items.length
        ? `<ul style="margin-top:0; padding-left:18px;">${items
            .map((v) => `<li>${formatter(v)}</li>`)
            .join('')}</ul>`
        : `<p style="color:#888; margin-top:0;">None scheduled</p>`
    }
  `;

  const summaryBlock = aiSummary
    ? `
      <div style="background:#e0f2f1; border-left:4px solid #00796b; padding:12px 16px; margin-bottom:20px; border-radius:4px;">
        <strong style="color:#00695c;">Today's Overview</strong>
        <p style="margin:6px 0 0;">${aiSummary}</p>
      </div>
    `
    : '';

  return `
    <div style="font-family: Arial, sans-serif; font-size: 15px; color:#222;">
      ${summaryBlock}
      ${section('Arrived', arrivals, formatArrival)}
      ${section('Departure', departures, formatDeparture)}
      ${section('Full-Day', fullDayActive, formatFullDay)}
    </div>
  `;
}

async function runDailyDigest() {
  try {
    const data = await buildDigestData();
    const aiSummary = await generateAiSummary(data);

    const digestText = buildDigestText({ ...data, aiSummary });
    const digestHtml = buildDigestHtml({ ...data, aiSummary });
    const dateLabel = moment.tz('Asia/Beirut').format('dddd, MMMM D, YYYY');

    await sendDigestEmail(digestText, digestHtml, dateLabel);
    console.log('Daily digest email sent successfully');
  } catch (err) {
    console.error('Daily digest job failed:', err.message);
  }
}

function scheduleDailyDigest() {
  cron.schedule('0 6 * * *', runDailyDigest, { timezone: 'Asia/Beirut' });
  console.log('Daily digest job scheduled for 6:00 AM Asia/Beirut');
}

module.exports = { scheduleDailyDigest, runDailyDigest };