# RTI Sahayak

**Turn a plain-language complaint into a properly formatted, correctly addressed RTI application — in under a minute.**

Built for **OOSC 4.0** — Problem Statement 3: *AI for Civic and Legal Empowerment*.

---

## The Problem

Citizens in India have real, usable rights under the RTI Act, 2005 — but most never exercise them. Not because the right doesn't exist, but because the process is intimidating: knowing which department to address, how to phrase a formal request, what the fee rules are, and what to do if there's no response.

RTI Sahayak removes that barrier. A user describes their problem in plain language — in English or Hindi — and the app produces a correctly formatted, properly addressed RTI application, grounded in the actual text of the RTI Act, ready to file.

This directly implements one of PS3's own listed directions: *"RTI Drafting Agent — converts a plain-language question into a properly formatted application to the right department."*

## Demo

📹 **Demo video:** https://youtu.be/g14lNNiibJ4?si=RiWCEVc7WwwhDQ9I
🌐 **Live prototype:** https://rti-sahayak-wbmm.onrender.com

## How It Works

The core design decision: **never let the AI invent facts about the user or the law.**

1. **Classify** — the grievance is classified into one of 8 known department categories (or explicitly flagged as unrecognized, rather than guessed).
2. **Generate (grounded)** — the AI writes *only* the substantive, point-wise information request, grounded in a condensed reference of the RTI Act embedded directly in the prompt. It never writes personal details, fees, or signatures.
3. **Assemble (deterministic)** — the applicant's name, address, district, state, date, and signature line are inserted by plain code, not by the AI. This guarantees these fields are always correct — no hallucination risk on the parts that matter most.
4. **Route** — the correct Public Information Officer / department and filing instructions (fee, BPL exemption, RTI Online Portal availability for central departments) come from a maintained routing table, not the model's guess.

This means the AI is only ever responsible for the part it's good at — understanding the grievance and phrasing a clear request — while everything factual is handled deterministically.

## Features

- Plain-language grievance input, in English or Hindi
- Automatic department classification across 8 common RTI categories (ration card, passport, municipal, water supply, scholarship, government jobs, land records, EPFO/pension)
- Honest fallback: if a grievance doesn't clearly match a known department, the app says so rather than guessing wrong
- Guided detail collection (name, address, state, district, contact, BPL status)
- Grounded, point-wise application generation citing the actual RTI Act — including the 2025 DPDP Act amendment to the personal-information exemption
- BPL fee exemption handling
- RTI Online Portal note for central government departments
- Copy and print/save-as-PDF for the generated application
- Clear filing information: correct authority, fee, and next steps if there's no response in 30 days

## Tech Stack

- **Frontend:** Plain HTML/CSS/JavaScript — no framework, no build step
- **Backend:** Node.js + Express
- **AI:** Groq API (`openai/gpt-oss-120b`), OpenAI-compatible chat completions
- **Grounding:** Context-stuffed RTI Act reference (no vector database — the reference corpus is small enough to embed directly in the prompt, which is simpler and more reliable at this scale)

## Project Structure

```
RTI/
├── server-groq.js          # Backend: classify → generate pipeline, Express server
├── reference-data.js       # Routing table (8 departments) + condensed RTI Act corpus
├── package.json
├── env.example              # Copy to .env and add your own API key
└── RTI_Sahayak_FrontendFinal (1).html   # Full frontend wizard UI
```

## Setup & Run Locally

**Requirements:** Node.js 18+, a free [Groq API key](https://console.groq.com/keys)

```bash
# 1. Clone the repo
git clone https://github.com/esraaaa19/RTI-Sahayak.git
cd RTI-Sahayak

# 2. Install dependencies
npm install

# 3. Set up your API key
cp env.example .env
# then open .env and paste your GROQ_API_KEY

# 4. Start the backend
node server-groq.js
# Should print: RTI Sahayak backend (Groq) running on http://localhost:3000

# 5. Open the frontend
# Simply open RTI_Sahayak_FrontendFinal (1).html in any browser
```

## API

**POST** `/api/generate-rti`

Request body:
```json
{
  "grievance": "My ration card application has been pending for three months",
  "name": "Applicant Name",
  "address": "House/street address",
  "contact": "phone or email",
  "location": "District, State",
  "timeframe": "May 2026",
  "bpl": false
}
```

Response (success):
```json
{
  "needsClarification": false,
  "referenceNumber": "RTI/2026/123456",
  "category": "ration_card",
  "authority": "Office of the District Food & Supplies Controller",
  "requestPoints": "1. The current status of...\n2. The reasons for any delay...",
  "filingNote": "Submit on plain paper to the PIO..."
}
```

Response (needs more info):
```json
{
  "needsClarification": true,
  "missingFields": ["timeframe"]
}
```

**GET** `/health` — returns `{"ok": true}` if the server is running.

## Known Limitations

- Covers 8 common RTI categories; grievances outside these are honestly flagged rather than misrouted, but not yet handled with a full response
- The Hindi language toggle currently translates UI copy, not the generated application itself
- Not deployed with persistent hosting for this submission — see setup instructions to run locally

## Roadmap

The same architecture — grounded generation + deterministic personal-data handling — extends naturally to the other directions in PS3 without a rebuild, just a different reference corpus and routing table:

- **Rights Navigator** — tenant, consumer, and workplace dispute guidance
- **Scheme Eligibility Reader** — plain-language welfare scheme eligibility answers

## Team

**PPGs**
- ASRA KAMAL — Backend / AI integration
- AESHA BAYNTHE — Frontend / UX
- ANSHIKA CHOUDHARY — Integration, testing, demo



