# Submission Guide

## Prototype

Branch: `settlement-trust-layer`

Run locally:

```bash
npm install
npm run db:reset
npm run dev
```

Open `http://localhost:3000`.

Primary demo routes:

- `/reports` — Trust Layer Signals, updated deal mix (Vs now partially in tool)
- `/shows/show_coastal_spell_dispute/settle` — disputed recoup, sign-off/status conflict
- `/shows/show_0002/settle` — standard Vs now settles in-app, working submit action
- `/shows/show_0007/settle` — complex Vs variant intentionally blocked

## What to Look For

The prototype is a settlement trust layer for standard Vs deals:

- Standard Vs deals (131 of 183 in the 24-month window) now settle in-app instead of falling into the unsupported state.
- Greenroom reads deal notes first and shows the canonical deal interpretation with source tags on every term.
- The worksheet explains the math row by row — gross, fees, recoups, expenses, split base, percentage take, guarantee floor — each tagged to its data source.
- Recoup ambiguity, structured-field conflicts, and disputed recoups are surfaced before final sign-off.
- Sign-off/status conflicts (21 in the data: system says Disputed, artist text says approval) are flagged on the settlement page.
- Complex Vs variants — walkout pots, tier ratchets, escalators (52 deals) — are identified and intentionally blocked.
- The Reports page Trust Layer Signals section surfaces data quality issues as live metrics.
- The "Submit to artist team" button is a working server action that transitions settlement status.

## Deliverables

- Working repo branch: `settlement-trust-layer`
- Memo: `SUBMISSION_MEMO.md`
- AI build and process log: `AI_USAGE_LOG.md`
- Loom walkthrough: recorded separately

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

TypeScript: no errors. Lint: no errors (three pre-existing warnings in `db/seed.ts` for unused helper variables — not introduced by this branch). Build: passes.

## Evaluation Criteria Coverage

**Scope tightly. Defend the cut.**
Standard Vs settlement plus trust/audit handling. 183 Vs deals, 36% of all past deals, zero in-app support before this build. The memo explains why dispute resolution, pre-show confirmation, and the agent portal each lost.

**Take it deep.**
Free-text-vs-structured-field drift, disputed recoups, expense caps, recoup deduction order, 21 sign-off/status conflicts found by querying the raw database, deterministic math, and intentional complex variant blocking.

**Show your reasoning.**
The memo covers the data basis, design choices, trade-offs explicitly accepted (depth over breadth on deal type coverage), validation plan, and next roadmap.

**Design for humans, not screens.**
The settle page answers the four questions Mariana and the tour manager need at 2am: what did Greenroom read the deal to mean, which number wins, which deductions changed the payout, which assumptions could an agent challenge.

**Use AI like a senior teammate would.**
AI tooling was used for brief analysis, database querying, implementation, and memo drafting. Product decisions — slice selection, what to block, why the math stays deterministic — were made explicitly. The full prompt log is in `AI_USAGE_LOG.md` and `PROMPTS.md`.
