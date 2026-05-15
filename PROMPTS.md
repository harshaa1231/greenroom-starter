# Prompt Log

The prompts below were used during this case study build, in sequence.
Each prompt is reproduced as sent. Outputs are summarized in `AI_USAGE_LOG.md`.

---

## 1. Read the case packet

> Read the Greenroom Applied AI PM case study and the Settlement at The Crescent brief carefully. Extract the actual task, deliverables, evaluation criteria, personas, and product constraints. Do not propose a solution until the data and repo have been inspected.

---

## 2. Explore the starter repo

> Inspect the starter repo structure, settlement page, deal math engine, query helpers, schema, data files, CEO memo, dispute thread, and transcripts. Map where a prototype should be built with minimal blast radius. Do not write any code yet.

---

## 3. Query the data directly

> Query the SQLite database at data/greenroom.db directly. Count deal types, settlement statuses, standard Vs examples, and complex Vs examples. Look specifically for contradictions between UI statuses, signoff text, recoups, and deal notes. Report exact counts and any anomalies found.

---

## 4. Choose the slice

> Based on the brief, the research, and the data findings, pick one defensible slice to take deep. Do not pick a generic calculator. Tie the choice to Mariana, Diego, Marcus, Sarah, and the Coastal Spell dispute. State what you are cutting and why.

---

## 5. Implement the Vs settlement engine

> Extend lib/dealMath.ts to support standard Vs deals. Read free-text notes before structured fields and treat notes as the source of truth. Surface conflicts, flagged assumptions, and source-tagged audit rows. Keep complex variants (walkout pots, tier ratchets, escalators) blocked with a clear reason string. Keep payout math deterministic — no probabilistic outputs.

---

## 6. Design the settlement UI

> Update app/shows/[id]/settle/page.tsx so Mariana can explain the settlement number at 2am. Add a Deal Read panel, a Vs Trust Summary (which leg won, expense treatment, recoup posture), and a source-tagged audit worksheet. Preserve the existing lifecycle bar, recoup section, and sign-off section. Add a sign-off/status conflict warning for settlements where the status is Disputed but the sign-off text is positive.

---

## 7. Add Trust Layer Signals to Reports

> The Reports page deal mix chart still marks Vs deals as "spreadsheet" even though standard Vs now settles in app. Fix the chart. Also add a Trust Layer Signals section that surfaces the status/signoff conflict count and the standard vs complex Vs breakdown as live metrics computed from the database. Add the required fields to the getReports() query in lib/queries.ts.

---

## 8. Wire the submit button

> The Submit to artist team button in the DealReadPanel is type="button" with no handler — it does nothing. Create a server action at app/shows/[id]/settle/actions.ts that transitions the settlement to submitted status and revalidates the page. Wire it through SupportedSettlement to DealReadPanel using a form element. Only trigger for settlements in draft status.

---

## 9. Verify and test

> Run TypeScript type checking, lint, and a build. Then verify the three demo routes load correctly: show_coastal_spell_dispute/settle (disputed recoup, Needs Review confidence, sign-off conflict warning), show_0002/settle (standard Vs settles to $5,197.50, submit button visible and functional), show_0007/settle (walkout pot detected and blocked).

---

## 10. Final submission cleanup

> Cross-reference all numbers in SUBMISSION_MEMO.md, SUBMISSION_README.md, and AI_USAGE_LOG.md against what the live Reports page and settle pages actually show. Update any mismatches. Remove internal planning files (PLAN.md, LOOM_SCRIPT.md) and the reference PDFs. Ensure the submission documents are clean, accurate, and consistent with the live product.

---

## Tuning notes

**What the AI got right without correction:**
- The Vs calculation engine (net/gross basis, expense cap parsing, guarantee floor, bonus application).
- The source-tag architecture for the audit rows.
- The sign-off/status conflict detection pattern.
- The `statusSignoffConflicts` query and the Trust Layer Signals section structure.

**What required explicit product direction:**
- The decision to block complex Vs variants entirely rather than calculate partially.
- The decision to treat free-text notes as the source of truth over structured fields.
- The decision to keep payout math deterministic rather than probabilistic.
- The ordering of what to cut and why (door deals, percentage-of-net, agent portal).
- The specific language used in confidence badges ("Needs Review" vs "Review Required" etc).
- Which three routes to use as demo routes and why.
