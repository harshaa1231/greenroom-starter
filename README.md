# Greenroom — Settlement Trust Layer

**Branch:** `settlement-trust-layer` | **By:** Harsha Talapaka

---

## What I built

The in-app settlement tool at The Crescent couldn't touch Vs deals — the most common deal type, 36% of all shows. Mariana was running every one of them in a Google Sheet at 2am.

I picked the 2am walkthrough as the slice. Not the full settlement problem — just the moment where Mariana has to sit with the tour manager, explain the number, and get a signature. That moment fails not because the math is hard, but because the deal read, the deduction order, and the source trail are invisible.

The prototype adds four things to the existing codebase:

- **Deal Read panel** — reads the free-text deal note first (the thing Mariana actually trusts), checks it against structured fields, and flags any conflicts. Source-tagged so every term shows where it came from.
- **Vs settlement engine** — standard Vs deals now produce an in-app payout with a source-tagged audit worksheet. Complex variants (walkout pots, tier ratchets) are detected and intentionally blocked.
- **Sign-off/status conflict detection** — 21 settlements in the data were marked Disputed but had positive artist sign-off text. The settle page now flags that contradiction instead of hiding it behind a badge.
- **Trust Layer Signals on Reports** — surfaces the 21 conflicts and the standard/complex Vs split as live metrics.

---

## Run it

```bash
npm install
npm run db:reset
npm run dev
```

Open `http://localhost:3000`.

---

## Where to look

| Route | What it shows |
|---|---|
| `/reports` | Trust Layer Signals, updated deal mix |
| `/shows/show_coastal_spell_dispute/settle` | Disputed recoup, sign-off conflict, Needs Review confidence |
| `/shows/show_0002/settle` | Standard Vs settling in-app — $5,197.50 to artist |
| `/shows/show_0007/settle` | Walkout pot detected, calculation blocked |

---

## Submission docs

- `SUBMISSION_MEMO.md` — the full PRD: slice choice, design decisions, cuts, validation plan, next roadmap
- `AI_USAGE_LOG.md` — how AI was used and where the product decisions came from
- `PROMPTS.md` — the actual prompts used, in sequence
