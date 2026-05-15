# Loom Script — Greenroom Settlement Trust Layer
# Runtime: ~6 minutes | Record in one take if possible

---

## Tabs to have open before you hit record
1. http://localhost:3000/reports
2. http://localhost:3000/shows/show_coastal_spell_dispute/settle
3. http://localhost:3000/shows/show_0002/settle
4. http://localhost:3000/shows/show_0007/settle

Start on your face. Don't share screen until [SCREEN] marker.

---

## THE SCRIPT

---

### INTRO [0:00–0:35] — face only, no screen yet

"It's 2am. A show just wrapped at a 650-capacity venue in Nashville.
The artist's tour manager is at the merch table, waiting to get paid and get on the bus.

Mariana — the lead booker — opens a Google Sheet she's used for three years,
manually punches in the ticket numbers, the expenses, the deal terms,
and tries to produce a number the tour manager will trust enough to sign.

If they trust it, the show closes. If they don't — if they say
'I don't think that marketing recoup should come off before our split' —
the show doesn't close tonight. It becomes a Monday email thread.
It becomes a dispute. It damages the agent relationship.

That's the problem I picked. Not the math — the trust.
Here's what I built and why."

---

### ACT 1 — THE PROBLEM IN NUMBERS [0:35–1:30]

[SCREEN — Tab 1: /reports. Pause two seconds before speaking.]

"This is the Reports page. Real numbers from 502 shows at The Crescent
over the last 24 months. $3.2 million in gross box office. $1.9 million paid to artists.

Look at the Settlement Craft Gap section.

63%. That's the share of deals the in-app tool literally cannot handle.
332 of 502 shows — Mariana opens a spreadsheet.
The CEO called this the company's biggest craft gap. Her words are right there at the top."

[Scroll to Deal Mix]

"Here's what that 63% actually looks like.
183 Vs deals — guarantee versus percentage of net, whichever's greater —
the single largest deal type, 36% of all deals.
102 percentage-of-net deals. 29 door deals.
Before this build, all of them said 'spreadsheet' in amber.

Vs deals now say 'standard: in tool' in green.
I'll show you what that means. But first scroll down, because the most
interesting thing I found wasn't in the UI at all."

[Scroll to Trust Layer Signals]

"I queried the database directly — the actual SQLite file — before writing any code.
And I found this.

21 settlements are marked Disputed in the system status field,
but the artist team's own sign-off message says things like
'Looks good' or 'OK. Good night.'

The status badge says one thing. The artist already approved it.
On 21 shows, those two things are contradicting each other
and nobody in the product is surfacing it.

The feature I built catches this in real time. Let me show you."

---

### ACT 2 — COASTAL SPELL: THE MESSY CASE [1:30–3:15]

[Tab 2: /shows/show_coastal_spell_dispute/settle. Let it load. Pause.]

"Coastal Spell. The show the brief specifically calls out.

The deal: $5,000 guarantee versus 80% of net after expenses,
expenses capped at $2,500. The Crescent applied a $900 marketing recoup —
Spotify pre-show ad spend — off the top, before the artist split.
WME disputed it. The GM conceded $720 to close the show.

Notice something: $720 is exactly 80% of $900.
The dispute wasn't about the recoup existing — it was about whether it should
reduce the gross before the percentage split. At 80%, that's $720.
The concession amount is the math of the dispute.

Now — look at the top of this page."

[Point to the red callout banner]

"Before Mariana even looks at the numbers: one recoup in dispute, $900 contested.
Front and center. Not buried in a notes field."

[Point to the Deal Read panel]

"This is the core of what I built. The Deal Read panel.

Greenroom reads the free-text deal note first — the thing Mariana
actually wrote when she booked the show — then checks it against
the structured database fields.

Every term has a source tag: 'deal notes' or 'structured field.'
Guarantee: $5,000 — from the deal notes.
Artist split: 80% — from the deal notes.
Expense cap: $2,500 — from the deal notes.

If those numbers drift — if someone updated the structured field
and it no longer matches what was actually agreed — you see a red flag here.
That's the brief's warning about field drift, made visible."

[Point to the flags on the right]

"The flags: 'Recoup language present' — this one needs to be resolved out loud
with the tour manager before sign-off.
'Deal changed after first entry' — there was a note added after booking,
flagging the recoup ambiguity.

The confidence badge says 'Needs Review,' not 'Ready to settle.'
The math can run, but Mariana should not submit this without
acknowledging these flags at the table."

[Scroll to Settlement Worksheet]

"The worksheet. Every row, every source.

Gross box office: $19,840 — from ticket sales.
Less fees: $1,984 — from ticket sales.
Less the $900 Spotify recoup against gross — from settlement recoups, amber, disputed.
Less approved expenses: $1,600 — within the $2,500 cap.
Split base — percentage take — guarantee floor.
The system shows which one wins."

[Scroll to Sign-off section]

"And here's that 21-settlement finding, live in the product.

Status: Disputed.
What the artist team actually wrote: 'OK — but flag any future marketing recoup deals.'

That's an approval with a condition. Not a dispute.

Greenroom now reads both — the status field and the sign-off text —
and surfaces this amber warning: status and sign-off are contradicting each other,
reconcile before closing.

Before this: Mariana sees 'Disputed', has no idea the artist moved on."

---

### ACT 3 — HAPPY PATH: STANDARD VS NOW SETTLES [3:15–4:15]

[Tab 3: /shows/show_0002/settle]

"Sunday Drivers. Standard Vs deal.
$1,405 guarantee versus 90% of net after expenses, expenses capped at $700.

Before this build: unsupported. Empty state. Open the spreadsheet."

[Point to the Deal Read panel — green, 'Ready to settle']

"Deal Read is green. Ready to settle.

Greenroom found the $1,405 guarantee in the deal note,
found the 90%, found the $700 expense cap,
checked them against the structured fields — they agree. Clean."

[Point to the hero number]

"Total to artist: $5,197.50. Out of the in-app engine. Not a spreadsheet.

Here's the math so you can follow it on the worksheet below.

Gross box office: $7,195. Fees: $720. Net: $6,475.
Expenses came in at $1,717 — but the deal caps them at $700. So $700 counts.
Split base: $6,475 minus $700 equals $5,775.
90% of $5,775 is $5,197.50.
That beats the $1,405 guarantee. Percentage wins.
The worksheet shows exactly that decision — explicit, not implied."

[Point to the three VsTrustSummary cards]

"These three cards are the trust summary — which leg won,
how expenses were treated, recoup posture.
If all three are clean, Mariana can walk the tour manager through them
in under two minutes."

[Point to the Submit button in Deal Read panel]

"And this button works. When the deal read is clean and the settlement is in draft,
hitting Submit is a real server action — the settlement transitions to submitted,
the lifecycle bar advances. No PDF. No manual email.
The artist team is next in the workflow."

---

### ACT 4 — THE HONEST BLOCK [4:15–4:40]

[Tab 4: /shows/show_0007/settle]

"Briar Road. Also Vs. $2,631 guarantee, 90% of net.
But this one has a walkout pot — after breakeven on the guarantee plus expenses,
all incremental gross goes to the artist. $8,516 in box office on this show.

Greenroom reads the base terms. Sees the walkout pot. Refuses to calculate.

That's intentional. A number that's wrong by thousands is worse than
an honest block. The tool earns trust by knowing what it can't do yet."

---

### ACT 5 — AI, CUTS, WHAT'S NEXT [4:40–5:40]

"On the AI usage — because this is an Applied AI PM role and it's worth being direct.

I built this with Claude Code. It read the brief, queried the database
and surfaced the 21-settlement conflict finding, built the Vs engine, built the UI.
The full prompt log is in the repo — every prompt, what I used from it, what I didn't.

But the payout math is deterministic. Regex and arithmetic. Not a language model.

At settlement time, Mariana needs a number that's the same every time —
inspectable, explainable, row by row to a skeptical tour manager.
AI's job here is to classify the deal read, flag ambiguity, and route
edge cases for human review before the show — not decide the payout.
That's the line.

On what I cut: door deals, percentage-of-net, revision history, receipt attachments,
the agent communication portal. All real problems. None of them the first trust wedge.

The other slices I considered each lost on one axis — dispute resolution treats
the symptom, pre-show confirmation has invisible payoff until the show runs,
agent portal requires trust to exist first.

What ships next: pre-show confirm-deal-read, so Mariana catches recoup ambiguity
on Wednesday not at 2am. Then revision history on disputed line items.
Then expand Vs — tier ratchets, then walkout pots."

---

### CLOSE [5:40–6:00]

"502 shows. 183 Vs deals. Zero in-app support before this.

131 of those now settle inside Greenroom.
52 are intentionally blocked until the modeling is right.

That's the slice. That's why."

---

## Notes for recording

**Pace:** Slower than you think on the numbers. Say "$5,197.50" — pause one beat — then keep going.

**The intro:** Eyes on the camera. No screen. Set up the human scene before anything technical.

**On screen:** Don't describe what's visible — they can read. Say why it's there.
"Less fees: $1,984 — from ticket sales" not just "this is the fees row."

**Stumbles:** Keep going. Do not restart mid-sentence. A small stumble and a
confident recovery reads better than a rehearsed pitch for a PM role.

**One run-through before recording:** Just to nail the tab order and confirm
the numbers match what you see on screen. The $5,197.50 on show_0002 should
be the first number you confirm is live before you hit record.
