# Loom Script — Greenroom Settlement Trust Layer
# Runtime: ~6 minutes | Record in one take if possible

---

## Tabs open before you hit record
1. http://localhost:3000/reports
2. http://localhost:3000/shows/show_coastal_spell_dispute/settle
3. http://localhost:3000/shows/show_0002/settle
4. http://localhost:3000/shows/show_0007/settle

Start on your face. Don't share screen until [SCREEN] marker.

---

## THE SCRIPT

---

### INTRO [0:00–0:35] — face only, no screen

[Eyes on camera. Human scene. No product yet.]

"It's 2am. A show just wrapped at a 650-capacity venue in Nashville.
The tour manager is at the merch table, waiting to get paid and get on the bus.

Mariana — the lead booker — opens a Google Sheet she's used for three years,
manually types in the ticket numbers, the expenses, the deal terms,
and tries to produce a number the tour manager will trust enough to sign off on tonight.

If they trust it, everyone goes home. If they don't —
if the tour manager says 'I don't think that marketing recoup should come off before our split' —
the show doesn't close. It becomes a Monday email thread. A dispute. A damaged relationship.

That's the problem I picked. Not the math — the trust.
Here's what I built, why I picked this slice, and what I cut."

---

### ACT 1 — THE PROBLEM IN NUMBERS [0:35–1:15]

[SCREEN — Tab 1: /reports. Let it load. Two-second pause.]

"This is the Reports page. 502 shows. $3.2 million gross. $1.9 million to artists.

That number on the left: 63%. That's the share of deals the in-app tool cannot handle.
332 of 502 shows — Mariana opens a spreadsheet.
The CEO's own words are right there at the top: 'Our customers love us in spite of it, not because of it.'"

[Scroll to Deal Mix]

"Here's what that 63% breaks into. 183 Vs deals — 36% of all deals, the largest type.
102 percentage-of-net deals. 29 door deals.
Before this build, all of them said 'spreadsheet' in amber."

---

### ACT 1.5 — WHY THIS SLICE, NOT THE OTHERS [1:15–1:50]

[Stay on Reports — Deal Mix visible. This is the scope defense beat.]

"I had four candidate slices: dispute resolution, pre-show deal confirmation,
the agent communication portal, and this one — Vs settlement support.

Dispute resolution lost because it treats the symptom.
The root cause is that the deal read is invisible at 2am — fix that first.

Pre-show confirmation is the right long-term play, but the payoff is invisible
until the show actually runs. You can't measure it the same night.

Agent portal requires trust to already exist inside the product before
you extend it to an external surface. That's not where we are.

Vs deals won because they're the highest-frequency unsupported case —
183 of 502 — and the Coastal Spell dispute proved exactly what goes wrong
when the deal read isn't surfaced: ambiguous prose, no audit trail, a $720 concession.

131 of those 183 are standard enough to support safely.
52 have walkout pots, tier ratchets, or escalators — I'll show you how I handled those.

That's the scope. Let me show you what I built inside it."

---

### ACT 2 — COASTAL SPELL: GOING DEEP ON THE MESSINESS [1:50–3:30]

[Tab 2: /shows/show_coastal_spell_dispute/settle. Pause while it loads.]

"Coastal Spell. The show the brief calls out specifically — and the one that shaped
every product decision I made.

The deal: $5,000 guarantee versus 80% of net after expenses, capped at $2,500.
The Crescent applied a $900 Spotify pre-show ad recoup off the top, before the split.
WME disputed it. The GM conceded $720.

Here's what I noticed when I looked at the data:
$720 is exactly 80% of $900. The concession is the math of the dispute —
whether the recoup reduces gross before the percentage split.
That's not in any UI. I found it by querying the database directly."

[Point to the Deal Read panel]

"This is the core feature. The Deal Read panel.

The brief says explicitly: prose contradicts structured values. Fields drift over time.
What the UI shows isn't always what the data says.

So Greenroom now reads the free-text deal note first — the thing Mariana
actually wrote when she booked the show — and checks it against the structured fields.
Every term has a source tag. Guarantee: $5,000, from the deal notes.
Split: 80%, from the deal notes. Cap: $2,500, from the deal notes.

If those drift from the structured fields in the database, you see a conflict flag.
That's taking it deep: not just calculating, but making the source of every input visible
so that at 2am, when the tour manager points at a number and says 'where did that come from,'
Mariana has an answer."

[Point to the flags]

"The flags catch the rest of the messiness. Recoup language present — needs to be
resolved out loud before sign-off. Deal changed after first entry — there's a
later note flagging the WME ambiguity.

The confidence badge says 'Needs Review.' Not ready to settle.
That's a design choice. The math can run. But Mariana shouldn't submit
without acknowledging these flags at the table. The badge protects her
from skipping past a real risk at 2am when she just wants to go home."

[Scroll to Worksheet]

"The worksheet. Gross: $19,840. Fees: $1,984. The $900 Spotify recoup
— amber, disputed — sitting exactly where it enters the math.
Expenses: $1,600, within the $2,500 cap. Then the split.

Every row tagged to its source. Any line item is challengeable,
and the trail exists to resolve it."

[Scroll to Sign-off]

"And here's the finding that came from querying the raw data, not the UI.

Status: Disputed. Artist sign-off: 'OK — but flag any future marketing recoup deals.'

That's an approval. Not a dispute. And the product was hiding the contradiction.

I found 21 settlements in this history where the status badge says Disputed
but the artist's own message is positive — 'Looks good,' 'OK. Good night.'

Greenroom now reads both fields and surfaces the conflict as an amber warning.
That's the difference between designing for screens — showing a badge —
and designing for humans — showing what's actually true."

---

### ACT 3 — HAPPY PATH: VS NOW SETTLES IN-APP [3:30–4:25]

[Tab 3: /shows/show_0002/settle]

"Sunday Drivers. Standard Vs. $1,405 guarantee versus 90% of net, $700 expense cap.
This show was in the 63% before tonight. Mariana ran it in a spreadsheet."

[Point to Deal Read — green, Ready to settle]

"Deal Read is green. Ready to settle. Greenroom parsed the deal note —
$1,405 guarantee, 90%, $700 cap — and the structured fields agree. Clean.

Here's the math, row by row.

Gross: $7,195. Fees: $720. Net: $6,475.
Expenses were $1,717 — capped at $700. So $700 counts.
Split base: $5,775. 90% of that: $5,197.50.
That beats the $1,405 guarantee. Percentage wins.

The worksheet shows exactly that decision, with every source tagged.
A tour manager can follow that math without trusting a black box."

[Point to Submit button]

"When the deal read is clean and the settlement is in draft,
this button is a real server action — settlement transitions to submitted,
lifecycle bar advances, artist team gets the next step.

That's the full loop. Deal read, math, submit — without Mariana touching a spreadsheet."

---

### ACT 4 — THE HONEST BLOCK [4:25–4:45]

[Tab 4: /shows/show_0007/settle]

"Briar Road. $2,631 guarantee, 90% net, $8,516 in box office.
And a walkout pot — after breakeven, all incremental gross goes to the artist.

Greenroom reads the base terms. Sees the walkout pot. Refuses to calculate.

This is a reasoning trade-off I made explicitly: I could have built a partial calculator
that gets the base terms right and ignores the walkout pot.
I didn't, because a confident number that's wrong by thousands is worse than
an honest block. The 52 complex Vs deals stay in this state until
the modeling is done right — not done fast."

---

### ACT 5 — REASONING, AI, WHAT'S NEXT [4:45–5:45]

"On the AI usage — because the question isn't whether I used AI,
it's whether I used it to amplify my judgment or substitute for it.

I built this with Claude Code. It read the case study brief, queried the database
and surfaced the 21-settlement conflict finding, built the calculation engine,
built the UI. The full prompt log is in the repo — every prompt, what I used, what I rejected.

The product decisions were mine: which slice, which cuts, where the tool blocks
instead of calculating. And the payout math is deterministic — regex and arithmetic,
not a language model — because at settlement time the number needs to be
the same every time, inspectable row by row, by someone who doesn't trust software at 2am.

AI should classify the deal read, detect ambiguity, route edge cases for review.
It should not decide the payout. That's the line, and I drew it on purpose.

One honest trade-off: I cut full AI extraction from the deal read.
The parser is regex-based, which means it misses deal notes that don't follow
the patterns I wrote. The risk is false confidence on an edge-case phrasing.
I accepted that trade-off because deterministic and wrong-sometimes beats
probabilistic and unpredictable when money is moving.

What ships next: pre-show confirm-deal-read, so the conflict is caught Wednesday
not at 2am. Then revision history on disputed lines — Coastal Spell needed
a record of the venue read, WME's read, and the concession. Then expand Vs:
vs-gross, tier ratchets, walkout pots, in that order."

---

### CLOSE [5:45–6:05]

"Five evaluation criteria. Let me map them in one sentence each.

Scope tightly: 183 Vs deals, the largest unsupported category, the clearest trust failure pattern.
Take it deep: field drift, disputed recoups, 21 status conflicts, expense caps, walkout pot blocking.
Show your reasoning: the memo explains every cut and the trade-off I accepted with each one.
Design for humans: every feature answers a question Mariana or the tour manager asks at 2am.
Use AI like a senior teammate: AI queried the data and built the tool. The judgment was mine.

502 shows. 131 now settle in-app. 52 are honestly blocked.
That's the slice. That's why."

---

## Recording notes

**The scope defense (Act 1.5):** This is the most important beat. Don't rush it.
Name each alternative slice, dismiss it in one sentence, then land on why Vs.

**The "design for humans" thread:** It's in the intro and in Coastal Spell ("the badge
protects her from skipping past a real risk at 2am"). Keep that 2am framing in your
voice throughout — it's the through-line of the whole demo.

**The close:** The five-criteria close is unusual but confident. It works if you deliver
it crisply, not as a list you're reading. Say it like you've been thinking about it
the whole time — because you have.

**Numbers pace:** One beat of silence after every dollar figure. "$5,197.50" — pause — "that beats the guarantee."

**Stumbles:** Keep going. For a PM role, how you handle an unexpected moment
is part of what they're evaluating.
