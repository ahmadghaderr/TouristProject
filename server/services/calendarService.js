const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_KEY_FILE || path.join(__dirname, '..', 'config', 'google-calendar-key.json'),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString();
}

function buildDescription(visit) {
  return `Hotel: ${visit.hotel}\nCar: ${visit.car}\nType: ${visit.type}`;
}

const REMINDER_24H = {
  useDefault: false,
  overrides: [{ method: 'popup', minutes: 1440 }],
};

async function createVisitEvents(visit) {
  const result = {};

  if (visit.dateFrom) {
    const start = new Date(visit.dateFrom);
    const res = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: `Arrival - ${visit.name}`,
        description: buildDescription(visit),
        start: { dateTime: start.toISOString(), timeZone: 'Asia/Beirut' },
        end: { dateTime: addHours(start, 1), timeZone: 'Asia/Beirut' },
        reminders: REMINDER_24H,
      },
    });
    result.arrivalEventId = res.data.id;
    result.arrivalEventLink = res.data.htmlLink;
  }

  if (visit.dateTo) {
    const start = new Date(visit.dateTo);
    const res = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: `Departure - ${visit.name}`,
        description: buildDescription(visit),
        start: { dateTime: start.toISOString(), timeZone: 'Asia/Beirut' },
        end: { dateTime: addHours(start, 1), timeZone: 'Asia/Beirut' },
        reminders: REMINDER_24H,
      },
    });
    result.departureEventId = res.data.id;
    result.departureEventLink = res.data.htmlLink;
  }

  return result;
}

async function updateVisitEvents(visit) {
  const result = {
    arrivalEventId: visit.arrivalEventId,
    departureEventId: visit.departureEventId,
  };

  if (visit.dateFrom) {
    const start = new Date(visit.dateFrom);
    const eventBody = {
      summary: `Arrival - ${visit.name}`,
      description: buildDescription(visit),
      start: { dateTime: start.toISOString(), timeZone: 'Asia/Beirut' },
      end: { dateTime: addHours(start, 1), timeZone: 'Asia/Beirut' },
      reminders: REMINDER_24H,
    };

    if (visit.arrivalEventId) {
      await calendar.events.update({
        calendarId: CALENDAR_ID,
        eventId: visit.arrivalEventId,
        requestBody: eventBody,
      });
    } else {
      const res = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: eventBody,
      });
      result.arrivalEventId = res.data.id;
    }
  } else if (visit.arrivalEventId) {
    await calendar.events
      .delete({ calendarId: CALENDAR_ID, eventId: visit.arrivalEventId })
      .catch(() => {});
    result.arrivalEventId = null;
  }

  if (visit.dateTo) {
    const start = new Date(visit.dateTo);
    const eventBody = {
      summary: `Departure - ${visit.name}`,
      description: buildDescription(visit),
      start: { dateTime: start.toISOString(), timeZone: 'Asia/Beirut' },
      end: { dateTime: addHours(start, 1), timeZone: 'Asia/Beirut' },
      reminders: REMINDER_24H,
    };

    if (visit.departureEventId) {
      await calendar.events.update({
        calendarId: CALENDAR_ID,
        eventId: visit.departureEventId,
        requestBody: eventBody,
      });
    } else {
      const res = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: eventBody,
      });
      result.departureEventId = res.data.id;
    }
  } else if (visit.departureEventId) {
    await calendar.events
      .delete({ calendarId: CALENDAR_ID, eventId: visit.departureEventId })
      .catch(() => {});
    result.departureEventId = null;
  }

  return result;
}

async function deleteVisitEvents(visit) {
  if (visit.arrivalEventId) {
    await calendar.events
      .delete({ calendarId: CALENDAR_ID, eventId: visit.arrivalEventId })
      .catch(() => {});
  }
  if (visit.departureEventId) {
    await calendar.events
      .delete({ calendarId: CALENDAR_ID, eventId: visit.departureEventId })
      .catch(() => {});
  }
}

module.exports = { createVisitEvents, updateVisitEvents, deleteVisitEvents };