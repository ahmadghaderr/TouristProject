const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateAiSummary({ arrivals, departures, fullDayActive }) {
  const totalCount = arrivals.length + departures.length + fullDayActive.length;

  if (totalCount === 0) {
    return 'No activity scheduled for today.';
  }

  const lines = [];
  arrivals.forEach((v) =>
    lines.push(`Arrival: ${v.name}, ${v.car}, ${v.hotel}`)
  );
  departures.forEach((v) =>
    lines.push(`Departure: ${v.name}, ${v.car}, ${v.hotel}`)
  );
  fullDayActive.forEach((v) =>
    lines.push(`Full-day active: ${v.name}, ${v.car}`)
  );

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Write a short, plain-language 2-3 sentence overview for a taxi dispatcher's morning briefing, based on today's bookings below. Mention total counts, flag any car conflicts (same car used more than once today), and note anything that needs attention. Do not repeat every individual booking, just give the high-level picture.

Bookings:
${lines.join('\n')}`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('AI summary generation failed:', err.message);
    return null;
  }
}

module.exports = { generateAiSummary };