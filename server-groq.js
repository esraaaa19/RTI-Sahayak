// server-groq.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ROUTING_TABLE, RTI_REFERENCE_DOC } = require('./reference-data');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/RTI_Sahayak_FrontendFinal (1).html');
});

const API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

if (!API_KEY) {
  console.warn('WARNING: GROQ_API_KEY is not set.');
}

async function callClaude(systemPrompt, userPrompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

function extractJson(text) {
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

function normalizeCategory(rawCategory) {
  if (!rawCategory) return 'unknown';
  const key = String(rawCategory).trim().toLowerCase().replace(/[\s-]+/g, '_');
  return Object.prototype.hasOwnProperty.call(ROUTING_TABLE, key) ? key : 'unknown';
}

async function classifyGrievance(grievanceText) {
  const categories = Object.keys(ROUTING_TABLE).filter(k => k !== 'unknown');
  const system = `You classify citizen grievances for RTI application drafting. Respond with ONLY a JSON object, no other text, no markdown fences.`;
  const user = `Categories: ${categories.join(', ')}, or "unknown" if none fit.

Given this grievance, output JSON with exactly these fields:
- category: one of the categories above
- information_sought: a 1-2 sentence plain restatement of exactly what status/information the applicant wants disclosed
- missing_info: array of strings naming any of [name, address, location, timeframe, contact] that seem essential but are not inferable from the text

Grievance: "${grievanceText}"`;

  const raw = await callClaude(system, user);
  const result = extractJson(raw);
  result.category = normalizeCategory(result.category);
  return result;
}

async function generateApplication({ grievance, timeframe, classification }) {
  const routing = ROUTING_TABLE[classification.category] || ROUTING_TABLE.unknown;
  const portalNote = routing.isCentral
    ? 'This is a central government authority — mention in filing_note that the applicant may alternatively file via the RTI Online Portal (rtionline.gov.in).'
    : '';

  const system = `You draft the core informational request section of RTI applications, grounded strictly in the reference material provided. You do NOT write personal details, salutations, or signatures — those are added separately by the system. Respond with ONLY a JSON object, no other text, no markdown fences.`;

  const user = `REFERENCE MATERIAL (RTI Act essentials):
${RTI_REFERENCE_DOC}

ROUTING INFO:
Public Authority: ${routing.authority || 'Not identified — ask the user to specify the department'}
${portalNote}

GRIEVANCE (as described by the applicant):
"${grievance}"

INFORMATION SOUGHT:
${classification.information_sought}

TIMEFRAME: ${timeframe || 'not specified'}

Write ONLY the substantive information-request content as 2-4 numbered, point-wise
statements (e.g. "1. The current status of...", "2. The reasons for any delay in...",
"3. The expected date by which..."). Each point must be specific and grounded in the
grievance above — do not write vague or generic points. Do NOT include: the applicant's
name, address, salutation ("To,"/"Sir/Madam"), fee statements, Section 8 declaration,
signature, or date — none of that belongs here, it's added separately. If the request
plausibly touches a third party's personal information, add one additional point noting
the 2025 exemption change rather than promising disclosure.

Output JSON with exactly these fields:
- request_points: the numbered point-wise request content as a single string, ready to display
- authority_display: the public authority name to show as the addressee
- filing_note: one sentence on where/how to file, mentioning the online portal if applicable`;

  const raw = await callClaude(system, user);
  return extractJson(raw);
}

app.post('/api/generate-rti', async (req, res) => {
  try {
    const { grievance, name, address, location, timeframe, contact, bpl } = req.body;

    if (!grievance || grievance.trim().length < 5) {
      return res.status(400).json({ error: 'grievance text is required' });
    }

    const classification = await classifyGrievance(grievance);

    const stillMissing = (classification.missing_info || []).filter(field => {
      if (field === 'name') return !name;
      if (field === 'address') return !address;
      if (field === 'location') return !location;
      if (field === 'timeframe') return !timeframe;
      if (field === 'contact') return !contact;
      return false;
    });

    if (stillMissing.length > 0) {
      return res.json({ needsClarification: true, missingFields: stillMissing });
    }

    const application = await generateApplication({ grievance, timeframe, classification });
    const referenceNumber = 'RTI/2026/' + Math.floor(100000 + Math.random() * 900000);

    res.json({
      needsClarification: false,
      referenceNumber,
      category: classification.category,
      authority: (ROUTING_TABLE[classification.category] && ROUTING_TABLE[classification.category].authority) || 'The Public Information Officer of the concerned department (please specify when filing)',
      requestPoints: application.request_points,
      filingNote: application.filing_note,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate application', detail: err.message });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RTI Sahayak backend (Groq) running on http://localhost:${PORT}`));