# Greenroom Applied AI PM Case Study: Settlement Trust Layer

## Slice

I chose the 2am settlement walkthrough for standard Vs deals, with explicit deal-read and recoup ambiguity checks.

This is narrower than "support every settlement type," but it is the leverage point I would defend in an interview: Vs deals are the largest unsupported deal category in the data, and the user research says the settlement problem is not only math. Mariana, Diego, Marcus, and Sarah all describe the same failure mode from different seats: the number is hard to trust because the deal read, deduction order, and source trail are not visible at the moment people need to sign off.

The prototype makes Greenroom useful for the most common version of that moment:

- Read the trusted free-text deal notes before structured fields.
- Settle standard guarantee-vs-percentage deals on net or gross.
- Apply fees, expense caps, active recoups, and structured bonuses in an auditable row-by-row worksheet.
- Surface conflict and ambiguity flags when structured fields disagree with notes, when a recoup is present, when a recoup is disputed, or when the deal is a complex Vs variant.
- Refuse to calculate walkout pots, tier ratchets, and escalators while still showing the deal read and why the calculator is intentionally blocked.

## Why this slice

The tempting build is a universal settlement calculator. I cut that. It would look impressive, but in 6-8 hours it would either under-model the real messiness or hide it behind a fragile parser.

The data points toward a sharper slice:

- The database has 537 deals; 195 are Vs deals, the largest deal type.
- Roughly 121 Vs deals look like standard guarantee-vs-percentage terms that can be supported safely.
- Roughly 57 Vs deals include walkout pots, ratchets, or escalators that need separate modeling.
- The Coastal Spell dispute is not a calculator bug. It is a trust/provenance bug: the recoup deduction order was ambiguous, and there was no canonical read everyone had agreed to.

The product bet is: get Greenroom into the settlement conversation by making a readable, sourceable settlement statement for common Vs deals, while clearly marking the cases the product should not pretend to know yet.

## What changed

### Settlement engine

`lib/dealMath.ts` now supports a `vs` calculation path for standard Vs deals:

- Parses guarantee, percentage, basis, and expense cap from `dealNotesFreetext`.
- Uses structured fields as fallback and flags conflicts against the notes.
- Supports net basis, gross basis, expense caps, recoups against gross, and structured bonuses.
- Returns a `dealRead`, `auditRows`, and `vsDetails` object so the UI can explain the result.
- Blocks complex variants like walkout pots, tier ratchets, and escalators with an explicit reason instead of returning a false sense of precision.

### Settlement UI

`app/shows/[id]/settle/page.tsx` now adds three trust-oriented surfaces:

- Deal read: shows the canonical interpretation Greenroom is using and where each term came from.
- Trust summary: shows what won, how expenses were treated, and whether recoups need attention.
- Auditable worksheet: shows source-tagged rows for gross, fees, recoups, expenses, split base, artist take, guarantee floor, and bonuses.

Good demo routes:

- `/shows/show_coastal_spell_dispute/settle`: disputed recoup and Coastal Spell ambiguity.
- `/shows/show_0002/settle`: standard Vs deal now calculable in-app.
- `/shows/show_0007/settle`: complex walkout-pot Vs deal intentionally blocked.

## Design choices

I treated `deal_notes_freetext` as the source of truth because the prompt explicitly says that is what Mariana trusts. The UI says this out loud instead of quietly favoring structured fields. When the app sees a mismatch, the mismatch becomes part of the settlement, not a hidden implementation detail.

I did not make the parser feel magical. This is an Applied AI PM exercise, but the right AI-shaped product here is not "LLM silently decides payout." It is "AI-assisted deal read with visible assumptions, confidence, and review flags." In production I would use an LLM or extraction model to propose a structured deal read, but I would require deterministic settlement math and human-visible approval before the number becomes official.

I also designed for the tired-user context. At 2am Mariana and Diego do not need a dense configuration panel. They need to know:

- What did Greenroom read the deal to mean?
- Which number wins?
- Which deductions changed the artist payout?
- Which assumptions might an agent challenge tomorrow?

## What I cut

I cut door deals, percentage-of-net deals, comps that count toward gross, receipt attachment flows, edit/revision workflows, agent sharing, and full AI extraction. I also cut complex Vs variants: walkout pots, tier ratchets, and escalators.

The important cut is complex Vs. It is tempting to partially support them, but that would violate the trust goal. A calculator that is right for standard Vs deals and honest about complex variants is better than one that computes a misleading number on a contract nuance.

## Validation plan

I would validate this in three layers:

1. Historical backtest: run the calculator against standard Vs deals in the database and compare against logged `settlements.total_to_artist`. Review differences by category: stale structured fields, absorbed expenses, bonus-only-in-notes, recoup treatment, and true math bugs.

2. Booker usability: sit with Mariana on five recent standard Vs settlements and ask her to narrate whether the deal read matches her spreadsheet. Success is not only the same final number. Success is fewer manual checks and fewer "I need my spreadsheet to explain this" moments.

3. Trust loop: give agents or tour managers a read-only preview of the worksheet and measure next-day pushback. I would track dispute rate, time-to-signoff, number of next-day clarification emails, and percentage of Vs settlements completed in Greenroom instead of spreadsheets.

## What I would ship next

First, I would add a "confirm deal read" step before show day. The system should flag recoup language, cap conflicts, and structured-field mismatches on Wednesday, not during the Friday night walkthrough.

Second, I would add revision history around disputed line items. Coastal Spell needed an audit trail that showed original venue read, WME read, Marcus' concession, and the final agreed number.

Third, I would support the next Vs variants in this order: vs-gross, tier ratchets, then walkout pots. That order expands coverage while preserving correctness.

## Loom walkthrough

Suggested flow:

1. Start with the problem statement: settlement is a trust conversation, not a calculator.
2. Show `/reports` or cite the deal mix: Vs is the largest unsupported category.
3. Open Coastal Spell and explain why the old UI failed the real problem.
4. Walk through the new Deal read, trust summary, and audit rows.
5. Open a standard Vs deal to show the happy path.
6. Open a walkout-pot Vs deal to show the deliberate block.
7. Close with cuts, validation, and next ship.
