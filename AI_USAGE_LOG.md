# AI Usage Log

This case study was built with AI tooling used as a senior product and engineering collaborator. The log below documents the prompts, workflow, decisions, and verification steps. The full prompt text is in `PROMPTS.md`.

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

- Identified deliverables: repo branch, memo, and Loom.
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

- 183 Vs deals in the 24-month window (183 of 502 past deals — 36%, the largest deal type).
- 131 standard Vs deals supportable safely; 52 include complex variants.
- 21 settlements marked "disputed" in status but carrying positive artist sign-off text.
- Coastal Spell: disputed $900 Spotify marketing recoup. The $720 concession is exactly 80% of $900 — the concession is the math of the dispute, not an arbitrary negotiation.
- Multiple records with structured `percentage` field conflicting with `deal_notes_freetext`.

### 4. Choose the Slice

Prompt:

> Pick one defensible slice that can be taken deep. Avoid a generic calculator. Tie the slice to Mariana, Diego, Marcus, Sarah, and the Coastal Spell dispute.

Output used:

- Chosen slice: standard Vs settlement support plus a deal-read/audit/recoup ambiguity layer.
- Cut: all other settlement types, full dispute workflow, payment workflow, receipts, and complex Vs variants.
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

> Update the settlement page so Mariana can explain the number at 2am. Add a visible deal read, trust summary, and source-tagged audit worksheet. Preserve existing UI style and avoid heavy configuration.

Output used:

- Added Deal Read panel with source tags and confidence badge.
- Added Vs Trust Summary cards (deal outcome, expense treatment, recoup posture).
- Added source-tagged audit rows with tone coloring.
- Added sign-off/status conflict warning for the 21-settlement data pattern.
- Preserved existing settlement lifecycle, recoup, signoff, and notes sections.

### 7. Add Trust Layer Signals to Reports

Prompt:

> Update the Reports page to surface the status/signoff conflict count and show Vs deals as now partially in tool. Add a Trust Layer Signals section. Fix the deal mix chart which still showed Vs as spreadsheet-only.

Output used:

- Added `statusSignoffConflicts`, `standardVsCount`, `complexVsCount` to `getReports()` in `lib/queries.ts`.
- Added Trust Layer Signals section to `app/reports/page.tsx`.
- Updated deal mix chart: Vs now shows "standard: in tool" in green instead of "spreadsheet" in amber.

### 8. Wire the Submit Action

Prompt:

> The Submit to artist team button in the Deal Read panel does nothing. Create a server action that transitions the settlement to submitted status and revalidates the page.

Output used:

- Created `app/shows/[id]/settle/actions.ts` with `submitSettlement` server action.
- Wired the action through `SupportedSettlement` → `DealReadPanel` using a form element.
- Button now transitions settlement status and advances the lifecycle bar.

### 9. Test the Edge Cases

Prompt:

> Verify the prototype against three routes: Coastal Spell disputed recoup, standard Vs happy path, and complex walkout-pot blocked path. Run TypeScript, lint, and localhost smoke tests.

Output used:

- `/shows/show_coastal_spell_dispute/settle`: Needs Review confidence, disputed recoup row, sign-off conflict warning.
- `/shows/show_0002/settle`: standard Vs settles to $5,197.50 in-app, submit button functional.
- `/shows/show_0007/settle`: complex walkout-pot deal flagged and blocked.
- `npx tsc --noEmit`: passed with no errors.
- `npm run lint`: passed with no errors.

### 10. Produce Submission Materials

Prompt:

> Write a concise PRD-quality memo explaining the slice, design choices, cuts, validation plan, and next roadmap. Update the submission README and AI usage log to reflect the final build with correct numbers from the live product.

Output used:

- `SUBMISSION_MEMO.md` — updated with numbers matching the live Reports page (183/502 Vs deals, 131 standard, 52 complex, 21 conflicts).
- `SUBMISSION_README.md` — updated deliverables list, removed LOOM_SCRIPT.md reference, added Reports to demo routes.
- `AI_USAGE_LOG.md` — this file.

## Key Product Decisions

**The free-text deal note is the source of truth.**
Structured fields are useful, but the brief explicitly says they drift. The prototype makes conflicts visible instead of hiding them. Every term in the Deal Read shows whether it came from the notes or the database.

**The calculator is deterministic.**
AI can propose a deal read, detect ambiguity, and route review. It should not silently decide payout. Mariana needs a number that is the same every single time and explainable row by row to a skeptical tour manager at 2am.

**Complex variants are intentionally blocked.**
Walkout pots and ratchets are not "unsupported because we forgot." They are blocked because a partial calculation would give a confident wrong number, which damages trust more than an honest block.

**The UI optimizes for explanation, not configuration.**
At 2am, the user needs a readable trust surface — what the deal means, what won, what was deducted, what is risky. Not a modeling cockpit.

**The Reports page surfaces the data quality finding.**
The 21 sign-off/status conflicts were invisible in the UI but visible in the raw data. Making that a live metric in the product turns a data audit into a feature.
