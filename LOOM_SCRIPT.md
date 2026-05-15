# Loom Script: Greenroom Settlement Trust Layer

Target length: 6-8 minutes.

## 0:00-0:45 - Frame

"I did not try to fix all of settlement. I picked the 2am walkthrough for standard Vs deals, with recoup and expense-cap ambiguity surfaced directly in the worksheet."

"The core insight from the brief and research is that settlement is a trust conversation. Mariana already knows how to do the math. The product needs to make the deal read, deduction order, and source trail visible enough that Diego can sign at 2am and Sarah does not have to re-litigate it Monday morning."

## 0:45-1:30 - Why this slice

Open the memo or cite the numbers:

- 195 of 537 deals are Vs deals.
- Roughly 121 are standard enough to support safely.
- The complex variants are intentionally left out.
- Coastal Spell shows the real failure: ambiguous marketing recoup treatment, not just missing arithmetic.

"I chose coverage plus trust for the common case over a universal calculator that would silently get edge cases wrong."

## 1:30-3:45 - Coastal Spell demo

Route: `/shows/show_coastal_spell_dispute/settle`

Point out:

- Deal read says the system is reading free-text notes first.
- Needs review because there is recoup language and a disputed recoup.
- The worksheet shows gross, fees, the recoup against gross, expenses, split base, percentage take, and guarantee floor.
- The recoup row is tagged to settlement recoups, so a tour manager or agent can see where the deduction entered the math.

"This is the product trying to prevent the exact WME dispute from becoming invisible. If we are going to apply the venue read, we should make that read inspectable and challengeable before final sign-off."

## 3:45-4:45 - Happy path

Route: `/shows/show_0002/settle`

Point out:

- This previously fell into the unsupported Vs empty state.
- It now produces an in-app artist payout.
- The worksheet still shows sources and assumptions, because trust is part of the feature, not extra polish.

"This is the adoption path: Mariana should not need to open her spreadsheet for standard Vs deals."

## 4:45-5:15 - What the data told me

"I queried the database directly before building anything. Here is what came back."

Show the query result or call out the numbers:

- 195 of 537 deals are Vs — the largest deal type. Only 18% of venues use the in-app tool. Those two numbers together explain why this slice exists.
- 24 settlements in the history are marked 'disputed' in the status field but have positive artist sign-off text — things like 'Looks good' or 'OK. Good night.' The badge and the data contradict each other.

Show the Coastal Spell sign-off section with the new amber conflict warning:

"That is the product response to what the data showed. Greenroom now reads past the status badge to the underlying fields and flags the contradiction. The brief calls this out as a differentiator — candidates who find it let it inform the product they build. This is that."

## 5:15-5:45 - Honest block

Route: `/shows/show_0007/settle`

Point out:

- The app reads the base terms.
- It flags a complex Vs variant because of the walkout pot.
- It refuses to calculate instead of creating a misleading number.

"That cut is important. A settlement tool earns trust by being clear about what it can and cannot settle."

## 5:45-7:00 - Trade-offs and next

"I cut door deals, comps toward gross, full AI extraction, receipt attachments, and the revision workflow. Those matter, but they are not the first trust wedge."

"Next I would ship a pre-show confirm-deal-read step so Mariana resolves ambiguity on Wednesday, not at 2am. Then I would add dispute revision history and expand Vs support to vs-gross, tier ratchets, and walkout pots."

## 7:00-7:30 - Close

"The product thesis is: settlement should become a structured collaboration, not an opaque spreadsheet exported after the fact. This prototype gets Greenroom back into the room for the most common unsupported deal, while being honest about the messy cases it should not yet automate."
