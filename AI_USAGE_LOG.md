# AI Usage Log

This case study was built with Codex as a senior product/engineering collaborator. The log below is written for reviewer readability: it captures the prompts, workflow, decisions, and verification steps without exposing hidden chain-of-thought.

## Goals for AI Use

- Move quickly through a messy product packet.
- Read both the product brief and the settlement brief before coding.
- Inspect the existing app and SQLite data directly.
- Use AI to generate options, but make explicit product cuts.
- Implement a working prototype and verify it locally.
- Produce submission materials that explain the reasoning, not just the code.

## Prompt Log

### 1. Read the Case Packet

Prompt:

> Read the Greenroom Applied AI PM case study and Settlement at The Crescent brief carefully. Extract the actual task, deliverables, evaluation criteria, personas, and product constraints. Do not propose a solution until the data and repo have been inspected.

Output used:

- Identified that the deliverables are repo branch, memo, and Loom.
- Identified that the evaluation favors tight scope, messy data handling, product judgment, and human-centered design.
- Identified settlement as a trust workflow, not just a calculation workflow.

### 2. Explore the Starter Repo

Prompt:

> Inspect the starter repo structure, settlement page, deal math engine, query helpers, schema, data files, CEO memo, dispute thread, and transcripts. Map where a prototype should be built with minimal blast radius.

Output used:

- Found `lib/dealMath.ts` as the settlement engine.
- Found `app/shows/[id]/settle/page.tsx` as the core UI.
- Found `deal_notes_freetext` and `recoups_json` as important data seams.
- Found that existing calculator supported flat and percentage-of-gross, but not Vs deals.

### 3. Query the Data

Prompt:

> Query the SQLite database directly. Count deal types, settlement statuses, standard Vs examples, complex Vs examples, and Coastal Spell records. Look for contradictions between UI statuses, signoff text, recoups, and notes.

Output used:

- 537 total deals.
- 195 Vs deals, the largest deal type.
- Roughly 121 standard-ish Vs deals.
- Roughly 57 complex Vs deals with walkout pots, ratchets, or escalators.
- Coastal Spell had a disputed marketing recoup and positive signoff text, matching the brief's warning about messy data.

### 4. Choose the Slice

Prompt:

> Pick one defensible slice that can be taken deep in 6-8 hours. Avoid a generic calculator. Tie the slice to Mariana, Diego, Marcus, Sarah, and the Coastal Spell dispute.

Output used:

- Chosen slice: standard Vs settlement support plus a deal-read/audit/recoup ambiguity layer.
- Cut: all settlement types, full dispute workflow, payment workflow, receipts, and complex Vs variants.
- Product rationale: get Greenroom into the 2am trust conversation without pretending to solve every contract shape.

### 5. Implement the Settlement Engine

Prompt:

> Extend `lib/dealMath.ts` to support standard Vs deals. Read free-text notes before structured fields. Surface conflicts, assumptions, and audit rows. Keep complex variants blocked with clear reasons. Keep payout math deterministic.

Output used:

- Added `DealRead`, `AuditRow`, and `VsDetails` output structures.
- Added standard Vs calculation for net/gross basis, expense caps, recoups against gross, guarantee floor, percentage take, and bonuses.
- Added flags for structured-field conflicts, recoup language, disputed recoups, bonus-only-in-notes, deal updates, and complex Vs variants.

### 6. Design the UI

Prompt:

> Update the settlement page so Mariana can explain the number at 2am. Add a visible deal read, trust summary, and source-tagged audit worksheet. Preserve existing UI style and avoid adding heavy configuration.

Output used:

- Added Deal Read panel.
- Added Vs Trust Summary cards.
- Added source-tagged audit rows.
- Preserved existing settlement lifecycle, recoup, signoff, and notes sections.

### 7. Test the Edge Cases

Prompt:

> Verify the prototype against three representative routes: Coastal Spell disputed recoup, standard Vs happy path, and complex walkout-pot blocked path. Run TypeScript, lint, build, and localhost smoke tests.

Output used:

- `/shows/show_coastal_spell_dispute/settle`: shows Needs Review, disputed recoup, recoup deduction row, and audit worksheet.
- `/shows/show_0002/settle`: standard Vs deal now settles in-app.
- `/shows/show_0007/settle`: complex walkout-pot deal is flagged and blocked.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with warnings only in `db/seed.ts`.
- `npm run build`: passed.

### 8. Produce Submission Materials

Prompt:

> Write a concise 1-2 page PRD-quality memo explaining the slice, design choices, cuts, validation plan, and next ship. Also write a Loom script and AI usage log that make the build process transparent and professional.

Output used:

- `SUBMISSION_MEMO.md`
- `LOOM_SCRIPT.md`
- `SUBMISSION_README.md`
- `AI_USAGE_LOG.md`

## Key Product Decisions

The free-text deal note is treated as the source of truth.

Structured fields are useful, but the brief explicitly says they drift. The prototype makes conflicts visible instead of hiding them.

The calculator is deterministic.

AI can propose a deal read, detect ambiguity, and route review. It should not silently decide payout.

Complex variants are blocked.

Walkout pots and ratchets are not "unsupported because we forgot." They are intentionally blocked because a partial calculation would damage trust.

The UI optimizes for explanation.

At 2am, the user needs a readable trust surface, not a modeling cockpit.

## Tooling and Verification Notes

Local setup required a few environment workarounds:

- PDF text extraction used Python `pypdf` because Poppler tools were not installed.
- The repo was cloned into `/private/tmp/greenroom-starter` because the configured Documents workspace was blocked by macOS permissions.
- npm cache was pointed at `/private/tmp/npm-cache` to avoid local cache permission issues.
- Network approval was required for cloning and dependency installation.

These were environment issues, not product issues. The final branch builds and runs with the standard project commands.
