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

- `/shows/show_coastal_spell_dispute/settle`
- `/shows/show_0002/settle`
- `/shows/show_0007/settle`

## What to Look For

The prototype is a settlement trust layer for standard Vs deals:

- Standard Vs deals now settle in-app instead of falling into the unsupported state.
- Greenroom reads deal notes first and shows the canonical deal interpretation.
- The worksheet explains the math row by row with source tags.
- Recoup ambiguity and disputed recoups are surfaced before final sign-off.
- Complex Vs variants are identified and intentionally blocked.

## Deliverables Included

- Working repo branch: `settlement-trust-layer`
- Memo: `SUBMISSION_MEMO.md`
- Loom outline: `LOOM_SCRIPT.md`
- AI build/process log: `AI_USAGE_LOG.md`

## Verification

The following checks passed locally:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

`npm run lint` completed with no errors. It reports only three existing warnings in `db/seed.ts` for unused helper variables.

## Evaluation Criteria Coverage

Scope tightly. Defend the cut.

The slice is standard Vs settlement plus trust/audit handling, not all of settlement.

Take it deep.

The prototype handles free-text-vs-structured-field drift, disputed recoups, expense caps, recoup deduction order, deterministic math, and complex variant blocking.

Show your reasoning.

The memo explains the data basis, design choices, trade-offs, validation plan, and next roadmap.

Design for humans, not screens.

The page is optimized for Mariana and the tour manager at 2am: deal read, outcome, risky assumptions, and audit trail are visible without a configuration-heavy workflow.

Use AI like a senior teammate would.

The AI usage log shows how Codex was used for document reading, repo exploration, database queries, implementation, verification, and memo drafting while preserving product judgment and explicit cuts.
