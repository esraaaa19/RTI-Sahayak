// reference-data.js
// Static reference material embedded directly into prompts (context-stuffing,
// no vector DB / embeddings needed — corpus is small enough to paste whole).

const ROUTING_TABLE = {
  ration_card:   { authority: "Office of the District Food & Supplies Controller", addressHint: "[District], [State]", fee: "₹10" },
  passport:      { authority: "Regional Passport Office", addressHint: "[City]", fee: "₹10" },
  municipal:     { authority: "Municipal Corporation", addressHint: "[Zone/Ward Office], [City]", fee: "₹10 (varies by state)" },
  water_supply:  { authority: "Water Supply / Jal Board", addressHint: "[City]", fee: "₹10" },
  scholarship:   { authority: "Directorate of Education", addressHint: "[State]", fee: "₹10" },
  government_job:{ authority: "[State] Public Service Commission", addressHint: "[State]", fee: "₹10" },
  land_records:  { authority: "Office of the Tehsildar", addressHint: "[Tehsil], [District]", fee: "₹10" },
  pension_epfo:  { authority: "EPFO Regional Office", addressHint: "[City]", fee: "₹10" },
  unknown:       { authority: null, addressHint: null, fee: "₹10" },
};

// Condensed from rti-act-reference-corpus.md — paste-ready for prompt embedding.
const RTI_REFERENCE_DOC = `
Who can apply, and to whom: Any Indian citizen can request information from a public
authority without giving a reason. The application is addressed to the Public/Central
Information Officer (PIO/CPIO) of the specific public authority holding the information.
Plain paper is acceptable; no prescribed form is required.

What the application must contain: applicant's name and postal address; a clear, specific
statement of the information sought (existing records/status, not new analysis or opinion);
fee payment details; a statement that the applicant is an Indian citizen.

Fees: ₹10 for central applications (many states also use ₹10, some vary). BPL applicants
are exempt from the fee with proof of status. Copying charges for large volumes are billed
only after processing, not upfront.

Timelines: 30 days for a standard response. 48 hours if the request concerns life or
liberty. 35 days if the request is transferred to another authority under Section 6(3).
No response within the deadline counts as a deemed refusal, which can be appealed.

Exemptions (Section 8): national security/sovereignty/economic interests; information
that would impede an ongoing investigation or prosecution; cabinet papers before a final
decision; commercial confidence/trade secrets harming a third party; personal information
about an individual. IMPORTANT (effective 14 Nov 2025): personal information about a
named third party is now exempt by default under the DPDP Act's amendment to Section
8(1)(j) — disclosure requires the authority to record a written public-interest
justification. Flag this to the user rather than promising disclosure when a request
touches another person's personal records. Section 8(2) still allows override of most
exemptions (not sovereignty/security) when public interest in disclosure is greater than
the harm from withholding.

Appeals: first appeal within 30 days of refusal/deadline, to a senior officer in the same
authority. Second appeal within 90 days of the first appeal decision, to the State/Central
Information Commission. No fee for either appeal.

Drafting conventions: state only what was actually asked; phrase as a request for existing
records/status, not a question requiring opinion; include a declaration that the
information is believed not to fall under Section 8 exemptions; if the request plausibly
touches a third party's personal information, add a note (not a refusal) about the 2025
change; leave name/address/signature as clearly marked placeholders, never invented.
`.trim();

module.exports = { ROUTING_TABLE, RTI_REFERENCE_DOC };
