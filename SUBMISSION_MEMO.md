# Greenroom Case Study Memo: Settlement Trust Layer

## Slice

I chose the 2am settlement walkthrough for standard Vs deals, paired with a deal-read and audit layer for recoup and expense-cap ambiguity.

This is intentionally narrower than "fix settlement." Settlement is really a bundle of problems: deal modeling, audit trails, prediction, agent communication, disputes, and payment lifecycle. The highest-leverage slice is the moment where Mariana has to sit with a tour manager, explain the number, and create enough trust that the agent does not reopen the settlement on Monday.

The prototype does four things:

- Settles standard guarantee-vs-percentage deals on net or gross.
- Reads free-text `deal_notes_freetext` before structured fields, treating prose as the source of truth.
- Shows source-tagged audit rows for gross, fees, recoups, expenses, split base, percentage take, guarantee floor, and bonuses.
- Flags cases that should not be silently automated: disputed recoups, structured-field conflicts, bonus-only-in-notes, renegotiated terms, and complex Vs variants like walkout pots or ratchets.

## Why this slice

The data and research point here. In the 24-month window the product covers, 183 of 502 past deals are Vs — the single largest deal type at 36% — yet the in-app settlement tool supported none of them. Across all Greenroom customers, only 18% actively use the in-app tool, meaning the most common deal type at The Crescent is also the least supported category industry-wide.

Of those 183 Vs deals, 131 are standard enough to support safely. The remaining 52 include walkout pots, tier ratchets, or escalators that require a separate modeling pass and are intentionally blocked.

Querying the database directly — not just the UI — revealed a pattern the product was hiding: 21 settlements are marked "disputed" in the status field while carrying positive artist sign-off text ("Looks good," "OK. Good night.," "👍"). The status badge and the underlying sign-off data tell different stories on 21 shows. Multiple records also show the structured `percentage` field conflicting with the `deal_notes_freetext` value — confirming the brief's warning about field drift is real, not hypothetical.

I cut the universal calculator because it would be the wrong product signal. The problem is not just arithmetic. Mariana, Diego, Marcus, and Sarah all describe the same trust failure: nobody wants a final number without the deal read, deduction order, and source trail. A calculator that is right for common Vs deals and honest about what it cannot settle is more useful than a broader calculator that gives false confidence.

The other candidate slices each lost on one axis:
- **Dispute resolution**: the dispute is a symptom. The cause is an unreadable deal at 2am — fix the cause first.
- **Pre-show deal confirmation**: the right long-term direction, but the payoff is invisible until the show runs. You can't measure trust the same night.
- **Agent communication portal**: depends on trust being established at settlement first, and requires an external surface that is out of scope for one slice.

## Design Choices

The "deal read" is a first-class product object. Greenroom now tells Mariana what it thinks the deal means, which fields came from notes versus structured data, and which assumptions should be shown during settlement. This directly addresses the brief's warning that prose and structured fields drift.

The math is deterministic. AI should propose and classify the deal read, detect ambiguity, and route edge cases for human review. The payout math remains deterministic, inspectable, and auditable — not because AI couldn't do it, but because at settlement time, Mariana needs a number that is the same every time and explainable row by row to a skeptical tour manager.

The UI optimizes for the tired 2am user. The page is not a configuration-heavy modeling screen. It answers the four questions Mariana and the tour manager need at the table:

- What did Greenroom read the deal to mean?
- Which number wins: guarantee or percentage?
- Which deductions changed the artist payout?
- Which assumptions could an agent challenge tomorrow?

The Trust Layer Signals section on the Reports page surfaces the 21 status/sign-off conflicts as a live metric — the data quality finding that was invisible in the UI but visible in the raw data.

## What I Cut

I cut door deals, percentage-of-net deals, comps that count toward gross, receipt attachment flows, edit/revision workflows, agent sharing, payment workflows, and full AI extraction.

The most important cut is complex Vs variants. Walkout pots, tier ratchets, and escalators materially change payout. The prototype reads the base terms and flags them, but intentionally blocks calculation. That is a product taste choice: trust is earned by knowing when not to calculate. The 52 complex Vs deals remain blocked until the modeling is done correctly — not done fast.

The trade-off accepted: by going narrow on standard Vs, the 102 percentage-of-net deals remain on spreadsheets. That cost was accepted because getting Vs deeply right — with source tags, conflict detection, expense caps, and honest blocking — builds more trust than broadly covering more deal types at shallow depth.

## What the Data Showed

Querying `data/greenroom.db` directly, not just the UI:

- 183 of 502 past deals (24-month window) are Vs — the single largest deal type.
- 131 of those are standard enough to support safely; 52 include complex variants that intentionally remain blocked.
- 21 settlements are marked "disputed" in the status field but carry positive artist sign-off text. The status badge and the underlying data contradict each other.
- Multiple records show the structured `percentage` field conflicting with the `deal_notes_freetext` value — the brief's warning about field drift is real.
- The Coastal Spell concession of $720 is exactly 80% of the disputed $900 recoup — the concession amount is the math of the dispute, not an arbitrary negotiation.

These findings directly informed the two most opinionated product choices: making the deal read a visible first-class object, and surfacing sign-off/status conflicts rather than hiding them behind a badge.

## Validation Plan

First, backtest standard Vs deals against historical `settlements.total_to_artist`, then categorize differences: stale structured fields, absorbed expenses, bonus-only-in-notes, recoup treatment, and true math gaps.

Second, run five recent settlements with Mariana and compare against her spreadsheet. Success is not only matching the number; it is reducing the number of times she has to leave Greenroom to explain the number.

Third, test the trust loop with tour managers and agents. Metrics: in-app Vs settlement adoption rate, time-to-signoff, next-day clarification emails, disputed recoup rate, and reopened settlement rate.

## What I Would Ship Next

First: a pre-show confirm-deal-read workflow. The product should flag recoup language, cap conflicts, and structured-field mismatches on Wednesday — not during the Friday-night walkthrough. The conflict detection is already built; it just needs to surface earlier.

Second: revision history around disputed line items. Coastal Spell needed a record of the original venue read, WME's read, Marcus's concession, and the final agreed number. That currently lives in email threads.

Third: expand Vs support in order — vs-gross, tier ratchets, then walkout pots. That order grows coverage while preserving the product's trust contract.

## Demo Routes

- `/shows/show_coastal_spell_dispute/settle` — disputed recoup, sign-off/status conflict, and the Coastal Spell ambiguity.
- `/shows/show_0002/settle` — standard Vs deal now settles in-app with source-tagged audit trail.
- `/shows/show_0007/settle` — complex walkout-pot Vs deal intentionally blocked.
- `/reports` — Trust Layer Signals section and updated deal mix showing Vs now partially in tool.
