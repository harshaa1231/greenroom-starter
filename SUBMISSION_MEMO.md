# Greenroom Case Study Memo: Settlement Trust Layer

## Slice

I chose the 2am settlement walkthrough for standard Vs deals, paired with a deal-read/audit layer for recoup and expense-cap ambiguity.

This is intentionally narrower than "fix settlement." Settlement is really a bundle of problems: deal modeling, audit trails, prediction, agent communication, disputes, and payment lifecycle. The highest-leverage slice is the moment where Mariana has to sit with a tour manager, explain the number, and create enough trust that the agent does not reopen the settlement on Monday.

The prototype does four things:

- Settles standard guarantee-vs-percentage deals on net or gross.
- Reads trusted `deal_notes_freetext` before structured fields.
- Shows source-tagged audit rows for gross, fees, recoups, expenses, split base, percentage take, guarantee floor, and bonuses.
- Flags cases that should not be silently automated: disputed recoups, structured-field conflicts, bonus-only-in-notes, renegotiated terms, and complex Vs variants like walkout pots or ratchets.

## Why this slice

The data and research point here. In the database, Vs is the largest deal type: 195 of 537 deals. Roughly 121 are standard enough to support safely, while roughly 57 include walkout pots, tier ratchets, or escalators that require a separate modeling pass. The prompt also says the free-text deal notes are the truth, and the Coastal Spell dispute shows why: the product's structured data can look clean while the actual business dispute lives in ambiguous prose.

I cut the universal calculator because it would be the wrong product signal. The problem is not just arithmetic. Mariana, Diego, Marcus, and Sarah all describe the same trust failure: nobody wants a final number without the deal read, deduction order, and source trail. A calculator that is right for common Vs deals and honest about what it cannot settle is more useful than a broader calculator that gives false confidence.

## Design Choices

I made the "deal read" visible as a first-class product object. Greenroom now tells Mariana what it thinks the deal means, which fields came from notes versus structured data, and which assumptions should be shown during settlement. This directly addresses the brief's warning that prose and structured fields drift.

I kept the math deterministic. This is an Applied AI PM case, but I would not ship "LLM decides the payout." In production, AI should propose and classify the deal read, detect ambiguity, and route edge cases for human review. The payout math should remain deterministic, inspectable, and auditable.

I designed for the tired 2am user. The UI is not a configuration-heavy modeling screen. It answers the questions Mariana and the tour manager need at the table:

- What did Greenroom read the deal to mean?
- Which number wins: guarantee or percentage?
- Which deductions changed the artist payout?
- Which assumptions could an agent challenge tomorrow?

## What I Cut

I cut door deals, percentage-of-net deals, comps that count toward gross, receipt attachment flows, edit/revision workflows, agent sharing, payment workflows, and full AI extraction.

The most important cut is complex Vs variants. Walkout pots, tier ratchets, and escalators materially change payout. The prototype reads the base terms and flags them, but intentionally blocks calculation. That is a product taste choice: trust is earned by knowing when not to calculate.

## Validation Plan

First, I would backtest standard Vs deals against historical `settlements.total_to_artist`, then categorize differences: stale structured fields, absorbed expenses, bonus-only-in-notes, recoup treatment, and true math gaps.

Second, I would run five recent settlements with Mariana and compare against her spreadsheet. Success is not only matching the number; it is reducing the number of times she has to leave Greenroom to explain the number.

Third, I would test the trust loop with tour managers and agents. Metrics: in-app Vs settlement adoption, time-to-signoff, next-day clarification emails, disputed recoup rate, and reopened settlement rate.

## What I Would Ship Next

Next I would add a pre-show "confirm deal read" workflow. The product should flag recoup language, cap conflicts, and structured-field mismatches on Wednesday, not during the Friday-night walkthrough.

Then I would add revision history around disputed line items. Coastal Spell needed a record of the original venue read, WME's read, Marcus' concession, and the final agreed number.

Finally, I would expand Vs support in this order: vs-gross, tier ratchets, then walkout pots. That order grows coverage while preserving the product's trust contract.

## Demo Routes

- `/shows/show_coastal_spell_dispute/settle` - disputed recoup and Coastal Spell ambiguity.
- `/shows/show_0002/settle` - standard Vs deal now calculable in-app.
- `/shows/show_0007/settle` - complex walkout-pot Vs deal intentionally blocked.
