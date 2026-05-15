# Loom Script — Greenroom Settlement Trust Layer
# Runtime: ~6 minutes

---

## Four tabs. Open them before you record.

| Tab | URL | What it covers |
|-----|-----|----------------|
| 1 | http://localhost:3000/reports | Problem size, scope defense, the data finding |
| 2 | http://localhost:3000/shows/show_coastal_spell_dispute/settle | The messy real case — depth + design |
| 3 | http://localhost:3000/shows/show_0002/settle | Happy path — standard Vs now works, submit button |
| 4 | http://localhost:3000/shows/show_0007/settle | Honest block — complex variant, the cut |

Start on your face. No screen until [SCREEN] marker.

---

## THE SCRIPT

---

### INTRO [0:00–0:35] — face only

"It's 2am. A show just wrapped at a 650-capacity venue in Nashville.
The tour manager is at the merch table, waiting to get paid and get on the bus.

Mariana — the lead booker — opens a Google Sheet she's used for three years,
manually types in the ticket numbers, the expenses, the deal terms,
and tries to produce a number the tour manager will trust enough to sign.

If they trust it, everyone goes home. If they don't —
if the tour manager pushes back on one line item —
the show doesn't close tonight. It becomes a Monday email thread.
It becomes a dispute. It damages the relationship with the agent.

That's not a math problem. That's a trust problem.
I found the leverage point inside it, and here's what I built."

---

### ACT 1 — THE PROBLEM AND THE LEVERAGE POINT [0:35–1:45]

[SCREEN — Tab 1: /reports. Two-second pause before speaking.]

"This is the Reports page. 502 shows over 24 months.
$3.2 million gross. $1.9 million paid to artists.

That number in the top left: 63%.
63% of deals at The Crescent cannot be settled inside Greenroom.
332 shows where Mariana goes back to a spreadsheet.
The CEO's own words are right there: 'Our customers love us in spite of it, not because of it.'

Now — settlement is several adjacent problems wearing one name:
deal modeling, audit trails, real-time prediction, the 2am walkthrough,
agent communication, dispute resolution.
I was not going to try to fix all of them."

[Scroll to Deal Mix]

"Here is where I found the leverage point.

183 Vs deals. Guarantee versus percentage of net, whichever's greater.
The single largest deal type. 36% of all deals.
And the tool couldn't touch any of them.

I had four candidate slices. Here's why three of them lost.

Dispute resolution: the disputes are a symptom.
The root cause is that the deal read is invisible at 2am. Fix the cause.

Pre-show deal confirmation: right long-term direction,
but the payoff is invisible until the show runs. You can't measure trust that night.

Agent communication portal: needs trust to exist inside the product first.
You can't share a number you don't believe in.

Vs settlement support won because it's the highest-frequency gap
with the most immediate measurable outcome — and the data confirmed exactly
what kind of failure it creates. Which brings me to the most interesting thing I found."

[Scroll to Trust Layer Signals]

"Before writing any code, I queried the database directly —
not the UI, the actual SQLite file.

This is what messy real-world data looks like.

21 settlements are marked Disputed in the system status field.
But the artist team's own sign-off message on those same records says
'Looks good' or 'OK. Good night.'

The status badge says one thing. The artist already approved it.
On 21 shows, the product's surface view and the underlying data
are telling different stories — and nobody's catching it.

That's the leverage point. The 2am walkthrough isn't broken because the math is hard.
It's broken because the trust signals are hidden. That's what I built for."

---

### ACT 2 — COASTAL SPELL: READING THE MESSY CASE [1:45–3:20]

[Tab 2: /shows/show_coastal_spell_dispute/settle. Pause while it loads.]

"Coastal Spell. The show the brief specifically calls out —
and the one that confirmed every product decision I made.

Deal: $5,000 guarantee versus 80% of net, expenses capped at $2,500.
The Crescent applied a $900 Spotify pre-show ad recoup off the top before the split.
WME disputed it. The GM conceded $720 to close the show.

I went looking for why the concession was $720 specifically.
$720 is exactly 80% of $900. The dispute was about whether the recoup
reduces gross before the percentage split — at 80%, that difference is $720.
The concession amount is the math of the dispute.
That's not in any field in the UI. I found it by reading the data closely."

[Point to the red callout banner at the top]

"Before Mariana opens any numbers: one recoup in dispute, $900 contested.
Not buried. First thing on the page."

[Point to the Deal Read panel]

"This is the core of what I built. The Deal Read panel.

Here's the opinionated position: the free-text deal note —
the thing Mariana actually wrote when she booked the show —
is treated as the source of truth. The structured database fields are checked against it.

Every term shows its source. Guarantee: $5,000 — from the deal notes.
Split: 80% — from the deal notes. Cap: $2,500 — from the deal notes.

When those drift from the structured fields — when someone updated the database
after the fact and it no longer matches what was agreed —
you get a red conflict flag. That's the 'fields drift over time' problem from the brief,
made visible in the product for the first time."

[Point to the flag cards]

"The flags. 'Recoup language present' — this needs to be resolved out loud at the table.
'Deal changed after first entry' — there's a note logged after booking flagging the ambiguity.

Confidence: 'Needs Review.' Not 'Ready to settle.'

That distinction is a design choice. The math can run.
But Mariana shouldn't click submit without acknowledging these flags with the tour manager.
At 2am, the badge is the thing that slows her down long enough to say it out loud.
That's designing for the human, not for the screen."

[Scroll to Worksheet]

"The worksheet. Every row, every source.

Gross: $19,840 — from ticket sales.
Less fees: $1,984 — from ticket sales.
Less the $900 Spotify recoup against gross — amber, disputed, visible.
Less $1,600 in approved expenses — within the $2,500 cap.
Then the split base, the percentage take, the guarantee floor.

Any line item is challengeable. The trail exists to resolve it."

[Scroll to Sign-off section]

"And here's the 21-settlement finding, live in the product.

System status: Disputed.
Artist team's actual message: 'OK — but flag any future marketing recoup deals.'

That's an approval with a note. Not a dispute.

Greenroom now reads both fields — the status and the sign-off text —
and surfaces an amber warning: these two things contradict each other,
reconcile before you close this settlement.

Designing for screens means showing the badge.
Designing for humans means surfacing what's actually true."

---

### ACT 3 — HAPPY PATH: STANDARD VS NOW SETTLES [3:20–4:15]

[Tab 3: /shows/show_0002/settle]

"Sunday Drivers. $1,405 guarantee versus 90% of net, expenses capped at $700.
Before this build: unsupported. Mariana's spreadsheet."

[Point to Deal Read — green]

"Deal Read is green. Ready to settle.
Greenroom parsed the deal note: $1,405 guarantee, 90%, $700 cap.
Checked against the structured fields. They agree."

[Point to the hero number]

"Total to artist: $5,197.50. Out of the in-app engine.

The math, so you can follow it:
Gross $7,195. Fees $720. Net $6,475.
Expenses $1,717 — but capped at $700. So $700 counts.
Split base $5,775. 90% of that: $5,197.50.
That beats the $1,405 guarantee. Percentage wins.
The worksheet shows that decision explicitly — which leg won and why."

[Point to the three VsTrust cards]

"Three cards above the worksheet: which leg won, how expenses were treated, recoup posture.
These answer the three questions a tour manager asks before they'll wire money.
If all three are clean, Mariana walks through them in two minutes.
No spreadsheet. No PDF. She just explains what the product already surfaced."

[Point to Submit button]

"And this button is a real server action.
Deal read is clean, settlement is in draft — hit submit.
Status transitions. Lifecycle bar advances. Artist team is next.
That's the full loop inside Greenroom."

---

### ACT 4 — THE HONEST BLOCK [4:15–4:35]

[Tab 4: /shows/show_0007/settle]

"Briar Road. $2,631 guarantee, 90% of net, $8,516 in gross.
And a walkout pot — after breakeven, all incremental gross goes to the artist.

Greenroom reads the base terms. Sees the walkout pot. Refuses to calculate.

I could have built a calculator that ignores the walkout pot and gets the base right.
I didn't — because a confident number wrong by thousands is worse than an honest block.
The 52 complex Vs deals stay here until the modeling is done properly.
That's not a limitation. That's the product being opinionated about when to trust itself."

---

### ACT 5 — REASONING, MEMO, AND AI [4:35–5:40]

"Two of the four deliverables are in the repo alongside the prototype.

The memo — SUBMISSION_MEMO.md — is the PRD-quality writeup: the slice choice,
design decisions, what I cut and why, a validation plan, and what ships next.
If you want the full reasoning on any trade-off I'm about to mention, it's in there.

On the cuts: door deals, percentage-of-net, receipt attachments, revision history,
the agent communication portal. All real problems. None the first trust wedge.
The trade-off I accepted: by going narrow on Vs, I left 102 percentage-of-net shows
still on spreadsheets. I made that call because getting Vs deeply right —
with source tags, conflict detection, expense caps, honest blocking —
builds more trust than broadly covering everything at shallow depth.

On AI: I built this with Claude Code. It read the brief, queried the database,
surfaced the 21-settlement conflict finding, wrote the calculation engine, built the UI.
The full prompt log is in AI_USAGE_LOG.md — every prompt, what I used, what I rejected.

The question for an Applied AI PM role isn't whether I used AI.
It's whether I used it to amplify my judgment or substitute for it.

The payout math is deterministic. Regex and arithmetic — not a language model.
At settlement time, Mariana needs the same number every time,
explainable row by row to a skeptical tour manager who does not trust software at 2am.
AI's job here is to classify the deal read, flag ambiguity, and route edge cases
for human review — before the show, not during it. That's the line.

What ships next: pre-show confirm-deal-read — catch the recoup ambiguity on Wednesday.
Then revision history on disputed line items.
Then expand Vs: vs-gross, tier ratchets, walkout pots, in that order."

---

### CLOSE [5:40–6:00]

"502 shows. 183 Vs deals. Zero in-app Vs support before this.

131 now settle inside Greenroom, with a source-tagged audit trail
and a conflict detector that reads past the status badge to the actual data.
52 are honestly blocked until the modeling is right.

The scope is tight. The reasoning is in the memo. The prototype runs.
And the AI amplified the build — it didn't make the calls.

That's the slice. That's why."

---

## Notes for recording

**Act 1 is the most important.** The leverage point framing — and the four-alternative
dismissal — needs to land confidently. Don't rush it. If you stumble here, pause and reset.

**"Opinionated" voice:** When you say "Here's the opinionated position: the free-text
deal note is the source of truth" — say it like you mean it. Not hedged.

**The 2am thread:** It's in the intro, in the Needs Review badge, in the submit button,
and in the close ("a skeptical tour manager who does not trust software at 2am").
Keep that voice consistent throughout — it's the through-line.

**Numbers:** Pause one beat after every dollar figure. "$5,197.50" — pause — "out of the in-app engine."

**Memo and AI log:** Don't show them on screen — just name them. The evaluator knows
where to find them. One sentence each is enough.

**Stumbles:** Keep going. A PM who recovers cleanly from a stumble is more impressive
than one who sounds rehearsed.
