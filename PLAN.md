# 10/10 Submission Plan

Evaluation has 5 criteria. Every task below maps to one or more of them.
Check each box the moment it's done. Do not move to the next section with
an unchecked box.

---

## Criterion scores: current → target

| Criterion | Now | Target |
|-----------|-----|--------|
| Scope tightly. Defend the cut. | 9 | 9.5 |
| Take it deep. | 6.5 | 9.5 |
| Show your reasoning. | 8.5 | 9.5 |
| Design for humans, not screens. | 7 | 9 |
| Use AI like a senior teammate. | 8 | 9 |
| **Overall** | **7.4** | **~9.3** |

---

## Block 1 — Submission mechanics (20 min)
> Without this, nothing else matters. A reviewer who can't run the repo or
> find the right branch scores it zero.

- [ ] **Decide on font regression.** `app/globals.css` and `app/layout.tsx` have
  uncommitted changes that remove the Fraunces display font added in commit
  `688672a`. Either revert these two files (`git checkout HEAD --
  app/globals.css app/layout.tsx`) to keep the designed UI, or commit the
  removal intentionally. Do not leave them in a mixed state.

- [ ] **Commit all remaining changes.** Stage and commit `db/seed.ts` and
  `next.config.ts`. Commit message should describe what changed.

- [ ] **Verify the build is clean.**
  ```bash
  npm run db:reset && npx tsc --noEmit && npm run lint && npm run build
  ```
  All three must pass before touching anything else.

- [ ] **Fork the repo to your personal GitHub account.** The submission requires
  "Forked GitHub repo." The current remote points to `samay-cbh/greenroom-starter`
  — the original starter. That is not your fork.

- [ ] **Push `settlement-trust-layer` branch to your fork.**
  ```bash
  git remote set-url origin https://github.com/YOUR_USERNAME/greenroom-starter
  git push -u origin settlement-trust-layer
  ```

- [ ] **Smoke test the fork.** Clone it fresh into a temp directory and run
  `npm install && npm run db:reset && npm run dev`. Confirm all three demo
  routes load cleanly:
  - `/shows/show_coastal_spell_dispute/settle`
  - `/shows/show_0002/settle`
  - `/shows/show_0007/settle`

---

## Block 2 — Take it deep: surface the data contradiction (45 min)
> The brief explicitly plants this as the differentiator. The database has
> **24 settlements** marked "disputed" with positive artist signoff text.
> The current `SignoffSection` renders both fields but never flags the
> contradiction. That is the one thing reviewers will check.

- [ ] **Add a signoff-vs-status conflict warning in `SignoffSection`.**
  When `settlement.status === "disputed"` AND `settlement.signoffText` is
  present, render an amber callout above the signoff quote:

  > "This settlement is marked Disputed, but the artist team's sign-off
  > reads as approved. The status should be reconciled before the record
  > is closed."

  Keep it one card, one sentence. Do not redesign the section.

- [ ] **Verify it appears on the Coastal Spell route.**
  `/shows/show_coastal_spell_dispute/settle` — the signoff is
  *"OK — but flag any future marketing recoup deals."* That should trigger
  the warning.

- [ ] **Verify it does NOT appear on clean routes.**
  `/shows/show_0002/settle` should have no warning (status is not disputed).

---

## Block 3 — Design for humans: add one action (30 min)
> The settle page is fully read-only. At 2am Mariana can see the deal read
> and audit trail but cannot do anything. One action closes this gap without
> adding a new feature.

- [ ] **Add a "Confirm deal read" button to `DealReadPanel`.**
  Show it only when `dealRead.confidence === "ready"` and there is no
  existing settlement or it is in `draft` status. On click it should simply
  advance the settlement to `submitted` via a server action or API call.
  Label: "Confirm and submit to artist team."

  If wiring the server action takes too long, render the button as a
  non-functional visual placeholder with a tooltip: *"Advances settlement
  to Submitted — connects to the agent email flow in production."* That
  is honest and still shows product intent.

- [ ] **Verify the button appears on `/shows/show_0002/settle`** (ready
  confidence, standard Vs, no existing settled status).

- [ ] **Verify the button does NOT appear on the Coastal Spell route**
  (confidence is "review", not "ready").

---

## Block 4 — Show your reasoning: memo (20 min)
> The memo is close but has two gaps that the live interview will expose.

- [ ] **Add the 18% adoption stat to "Why this slice".** The brief states it
  directly: *"Industry-wide, only ~18% of customers actively use the in-app
  settlement tool."* This number belongs in the memo's rationale alongside
  the 195 Vs deal count. One sentence.

- [ ] **Pre-answer the alternative slices.** Add a short paragraph that names
  the other cuts and explains why each lost:
  - *Dispute resolution*: the dispute is a symptom. The cause is an unreadable
    deal at 2am. Fix the cause.
  - *Pre-show deal confirmation*: right direction but the payoff is invisible
    until the show runs. Trust-layer-at-settlement has an observable outcome
    the same night.
  - *Agent communication*: requires external surface (email, portal). Too much
    scope for one slice; depends on trust being established first.

- [ ] **Add a "What the data showed" section (4–5 bullet points).**
  Include the specific numbers found by querying the database:
  - 195 of 537 deals are Vs — the largest deal type.
  - ~121 are standard enough to support; ~57 include complex variants.
  - 24 settlements are marked "disputed" with positive signoff text —
    the status badge overstates the conflict.
  - The `notes_freetext` field and structured percentage field conflict
    on multiple records — the brief's warning is real, not hypothetical.

- [ ] **Memo must stay under 2 pages when rendered.** Print to PDF after
  edits and confirm it does not exceed 2 pages.

---

## Block 5 — Loom (60–90 min)
> This is a required deliverable. The script is in `LOOM_SCRIPT.md`.
> Without the recording the submission is incomplete.

- [ ] **Record the Loom.** Target 7 minutes. Follow the script in
  `LOOM_SCRIPT.md` exactly. Do not improvise the structure.

- [ ] **Cover all three demo routes in the recording:**
  - Coastal Spell (disputed recoup + signoff conflict warning)
  - show_0002 (standard Vs happy path + confirm button)
  - show_0007 (complex walkout-pot intentionally blocked)

- [ ] **Include the data finding moment** (60 seconds, after happy path):
  Show the database numbers — 24 disputed settlements with positive signoff —
  and explain that querying the data, not the brief, found this. Show the
  new signoff-conflict warning as the product response to it.

- [ ] **Stay under 10 minutes.** The brief says 5–10 minutes. Going over
  signals poor editing judgment.

- [ ] **Upload to Loom and copy the share URL** into `SUBMISSION_README.md`
  under a "Loom" heading.

---

## Block 6 — Final checklist before submitting

- [ ] `npx tsc --noEmit` — no errors
- [ ] `npm run lint` — no errors (warnings in seed.ts are pre-existing, acceptable)
- [ ] `npm run build` — clean build
- [ ] All three demo routes load in a fresh `npm run dev`
- [ ] Memo is under 2 pages
- [ ] Loom URL is in `SUBMISSION_README.md`
- [ ] Branch `settlement-trust-layer` is pushed to your personal fork
- [ ] Repo is public (or reviewer has access)

---

## What is NOT in this plan

These are explicitly cut. Do not add them.

- Pre-show deal confirmation workflow
- Dispute resolution / revision history
- Agent email / sharing surface
- Payment lifecycle actions
- Complex Vs variant support (walkout pots, ratchets)
- Full AI deal extraction

The brief says: *"Pick one slice and take it deep. Don't try to fix the
whole thing."* The plan above takes the chosen slice to completion without
scope creep.
