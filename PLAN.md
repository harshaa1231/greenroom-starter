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

## Block 1 — Submission mechanics ✅
> Without this, nothing else matters. A reviewer who can't run the repo or
> find the right branch scores it zero.

- [x] **Decide on font regression.** Reverted `app/globals.css` and
  `app/layout.tsx` to HEAD — Fraunces display font kept, designed UI
  preserved.

- [x] **Commit all remaining changes.** `db/seed.ts` (unused helper removal)
  and `next.config.ts` (turbopack config) committed in commit `9f359a5`.

- [x] **Verify the build is clean.**
  `npx tsc --noEmit` — PASS
  `npm run lint` — PASS (no errors)
  `npm run build` — PASS

- [ ] **Fork the repo to your personal GitHub account.** The submission
  requires "Forked GitHub repo." Current remote points to
  `samay-cbh/greenroom-starter` — the original starter. Must be your fork.
  ```bash
  # On GitHub: fork samay-cbh/greenroom-starter to your account
  git remote set-url origin https://github.com/YOUR_USERNAME/greenroom-starter
  git push -u origin settlement-trust-layer
  ```

- [ ] **Smoke test the fork.** Clone fresh and run:
  ```bash
  npm install && npm run db:reset && npm run dev
  ```
  Confirm all three demo routes load:
  - `/shows/show_coastal_spell_dispute/settle`
  - `/shows/show_0002/settle`
  - `/shows/show_0007/settle`

---

## Block 2 — Take it deep: surface the data contradiction ✅
> The brief explicitly plants this as the differentiator. The database has
> **24 settlements** marked "disputed" with positive artist signoff text.

- [x] **Added signoff-vs-status conflict warning in `SignoffSection`.**
  When `settlement.status === "disputed"` AND `settlement.signoffText` is
  present, amber callout renders above the signoff quote:
  "This settlement is marked Disputed, but the artist team's sign-off reads
  as approved. The status should be reconciled before the record is closed."

- [ ] **Verify it appears on the Coastal Spell route.**
  Run `npm run dev` and open `/shows/show_coastal_spell_dispute/settle`.
  The amber "Status conflict" callout must appear above the signoff text.

- [ ] **Verify it does NOT appear on `/shows/show_0002/settle`.**
  Status on that route is not disputed — no callout should show.

---

## Block 3 — Design for humans: add one action ✅
> The settle page was fully read-only. One action added without new feature scope.

- [x] **Added "Confirm and submit" button to `DealReadPanel`.**
  Appears only when `dealRead.confidence === "ready"` AND no settlement
  exists or it is in `draft` status. Tooltip explains it advances to
  Submitted and connects to agent email flow in production.

- [ ] **Verify the button appears on `/shows/show_0002/settle`.**
  Confidence is "ready", standard Vs, settled status is paid (button should
  NOT appear — that settlement is already past draft). Find a show with no
  settlement or draft status to confirm button logic works.

- [ ] **Verify it does NOT appear on the Coastal Spell route.**
  Confidence there is "review" — button must be absent.

---

## Block 4 — Show your reasoning: memo ✅
> Both gaps are now closed.

- [x] **18% adoption stat added to "Why this slice"** — first paragraph of
  that section now pairs the 195 Vs deal count with the 18% adoption figure.

- [x] **Alternative slices pre-answered** — paragraph added to "Why this slice"
  naming dispute resolution, pre-show confirmation, and agent communication
  and explaining why each lost.

- [x] **"What the data showed" section added** — 4 bullets with specific
  database numbers: 195 Vs deals, 121/57 split, 24 disputed/positive-signoff
  contradictions, structured field conflicts.

- [ ] **Confirm memo stays under 2 pages when rendered.** Open
  `SUBMISSION_MEMO.md`, copy into a doc, print to PDF at standard formatting
  (11pt, 1in margins). Must not exceed 2 pages. Current word count: 1029.

---

## Block 5 — Loom (YOU must record this)
> Required deliverable. Script updated. Recording is on you.

- [x] **Loom script updated** — data-finding moment added at 4:45–5:15,
  before the honest-block section. Shows the 24-settlement query result and
  the new signoff-conflict warning as the product response.

- [ ] **Record the Loom.** Target 7 minutes. Follow `LOOM_SCRIPT.md`.

- [ ] **Cover all three demo routes:**
  - Coastal Spell — disputed recoup + amber signoff conflict warning
  - show_0002 — standard Vs happy path
  - show_0007 — complex walkout-pot intentionally blocked

- [ ] **Include the data finding moment** (4:45–5:15 in the script).
  Show the database numbers, explain you found it by querying directly.

- [ ] **Stay under 10 minutes.**

- [ ] **Upload to Loom. Paste share URL into `SUBMISSION_README.md`**
  under a "Loom" heading.

---

## Block 6 — Final checklist before submitting

- [x] `npx tsc --noEmit` — PASS
- [x] `npm run lint` — PASS
- [x] `npm run build` — PASS
- [ ] All three demo routes verified in a running `npm run dev`
- [ ] Memo confirmed under 2 pages (print to PDF)
- [ ] Loom URL added to `SUBMISSION_README.md`
- [ ] Branch `settlement-trust-layer` pushed to your personal fork
- [ ] Repo is public (or reviewer has been granted access)

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
