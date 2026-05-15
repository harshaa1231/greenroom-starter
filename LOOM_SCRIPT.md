# Loom Script — Greenroom Settlement Trust Layer
# Runtime: ~6 minutes | Record in one take if possible

---

## Tabs to have open before you hit record
1. http://localhost:3000/reports
2. http://localhost:3000/shows/show_coastal_spell_dispute/settle
3. http://localhost:3000/shows/show_0002/settle
4. http://localhost:3000/shows/show_0007/settle

Start on your face. Don't share screen until the [SCREEN] marker.

---

## THE SCRIPT

---

### INTRO [0:00–0:35] — face only, no screen

"It's 2am. A show just wrapped at a 650-cap venue in Nashville.
The artist's tour manager is at the merch table, waiting to get paid and get on the bus.

Mariana — the lead booker — opens a Google Sheet, manually punches in
the ticket numbers, the expenses, the deal terms, and produces a number.
If the tour manager trusts that number, they sign, Mariana wires the money, everyone goes home.
If they don't — if they say 'I think that recoup shouldn't come off the top before our split' —
the show doesn't close tonight. It becomes a Monday email thread. It becomes a dispute.
It damages the relationship with the agent.

That's the problem I picked. Not the math — the trust.

Here's what I built and why."

---

### THE PROBLEM IN NUMBERS [0:35–1:30]

[SCREEN — Tab 1: /reports]

"This is the Reports page. Real numbers from The Crescent's show history.

That big number on the left — 62%. That's the share of deals the in-app
settlement tool literally cannot handle. 537 shows. 334 of them, Mariana opens
a spreadsheet. The CEO flagged this as the company's biggest craft gap —
her exact words are right there at the top of this page.

62% unsupported is the headline. But when you look at what's inside that number,
it becomes a much more specific problem."

[Scroll to Deal Mix]

"This is the deal mix. 537 deals broken out by type.
The two green bars — flat guarantees and percentage-of-gross — those work in the tool today. 203 deals.
Everything else is amber. Spreadsheet.

The single largest category is Vs deals. 195 of 537. 36% of all deals.
Guarantee versus percentage of net, whichever's greater.
That's the deal type I chose to take deep.

You'll see it now says 'standard: in tool' in green. I'll show you exactly what that means.
But first — scroll down — because the most interesting thing I found wasn't the deal mix."

[Scroll to Trust Layer Signals]

"I queried the database directly before writing any code.
Not the UI — the actual SQLite file. And I found this.

26 settlements in The Crescent's history are marked 'Disputed' in the system
status field — but the artist team's own sign-off message says things like
'Looks good' or 'OK. Good night.' or just a thumbs up.

The system says disputed. The artist already approved it.
Those two things are contradicting each other on 26 shows.
That's not a minor data issue. That's a booker looking at a 'Disputed' badge
on a show the artist team moved on from weeks ago, with no idea which one to trust.

The product I built catches that in real time. Let me show you."

---

### COASTAL SPELL — THE MESSY CASE [1:30–3:15]

[Tab 2: /shows/show_coastal_spell_dispute/settle — let it load, pause a beat]

"Coastal Spell. This is the show the brief specifically calls out.

The deal: $5,000 guarantee versus 80% of net after expenses, capped at $2,500.
The Crescent also applied a $900 marketing recoup — Spotify pre-show ad spend —
against gross, before the split. WME disputed it. Marcus, the GM, ended up
conceding $720 to close the show. Everyone was annoyed.

Look at the top of this page."

[Point to the red callout banner]

"Before Mariana even opens the math, she sees: one recoup in dispute, $900 contested.
It's not buried. It's the first thing on the page.

Now this panel — this is the core of what I built."

[Point to the Deal Read panel]

"The Deal Read. Greenroom reads the free-text deal note first —
the thing Mariana actually wrote when she booked the show —
then checks it against the structured database fields.

Every term has a source tag: 'deal notes' or 'structured field' or 'system.'
Guarantee: $5,000 — from the deal notes. Artist split: 80% — from the deal notes.
Expense cap: $2,500 — from the deal notes.

If those numbers contradict what's in the database, you see a red flag.
That's how you catch field drift — when someone updated the structured field
after the fact and it no longer matches what was actually agreed."

[Point to the flags on the right]

"These flags on the right. 'Recoup language present' — watch this one closely.
'Deal changed after first entry' — there's a note that was added on March 19th
saying the recoup interpretation was disputed by WME.

The confidence badge says 'Needs Review.' Not 'Ready to settle.'
Mariana can run the math, but she shouldn't submit this without
acknowledging these flags out loud with the tour manager."

[Scroll to the Worksheet]

"The worksheet. Every row, every number, every source.

Gross box office — from ticket sales.
Less fees — from ticket sales.
Less the $900 Spotify recoup against gross — from settlement recoups, amber,
because it's disputed. The number is in the math, but it's flagged so nobody
at the table is surprised.

Then: split base. Artist percentage take. Guarantee floor.
The system tells you which one wins, and by how much."

[Scroll to the Sign-off section at the bottom]

"And here's the 26-settlement data finding, live in the product.

Status: Disputed.
What the artist team actually wrote: 'OK — but flag any future marketing recoup deals.'

That's an approval with a note. Not a dispute.

Greenroom now reads both — the status field and the sign-off text —
and surfaces this amber warning: status and sign-off conflict,
reconcile before closing.

Before this build, a booker sees the badge, sees Disputed, has no idea
the artist team already moved on. That's the bug this feature fixes."

---

### HAPPY PATH — STANDARD VS NOW SETTLES [3:15–4:15]

[Tab 3: /shows/show_0002/settle]

"Sunday Drivers. Standard Vs deal. $1,405 guarantee versus 90% of net
after expenses, expenses capped at $700.

Before this build: unsupported. Empty state. Open your spreadsheet.

Now look."

[Point to Deal Read — green, 'Ready to settle']

"Deal Read is green. Ready to settle.

Greenroom parsed the deal note — found the $1,405 guarantee,
found 90%, found the $700 cap, checked them against the structured fields.
They agree. No conflicts."

[Point to the hero number]

"Total to artist: $5,197.50.

Here's the math so you can follow it.
Gross box office was $7,195. Fees were $720. Net: $6,475.
Expenses hit $1,574, but they're capped at $700 — so $700 counts.
Split base: $6,475 minus $700 equals $5,775.
90% of that is $5,197.50.

That beats the $1,405 guarantee. So percentage wins.
That decision is explicit in the worksheet, not implied."

[Point to the three VsTrustSummary cards]

"These three cards. Which leg won and by how much. How expenses were treated.
Recoup posture. If all three are clean, Mariana can walk a tour manager
through them in under two minutes."

[Point to the Submit button]

"And this button works. When the deal read is clean and the settlement is in draft,
Mariana hits Submit — it's a real server action, the settlement transitions
to submitted status, the lifecycle bar advances. No PDF export. No manual email.
The artist team is next in the workflow."

---

### THE HONEST BLOCK [4:15–4:35]

[Tab 4: /shows/show_0007/settle]

"Briar Road. Also a Vs deal. $2,631 guarantee. But this one has a walkout pot —
after breakeven, all incremental gross goes to the artist.
That changes the payout structure in a way the calculator can't safely handle yet.

Greenroom reads the base terms. Sees the walkout pot. Refuses to calculate.

That's the product taste call. A confident number that's wrong by thousands
is worse than an honest block. The tool earns trust by knowing what it can't do."

---

### AI, CUTS, WHAT'S NEXT [4:35–5:45]

"Quick on the AI usage — because it matters for this role.

I built this with Claude Code. It read the brief, queried the database
and surfaced the 26-settlement conflict finding, built the calculation engine,
generated the UI. The full prompt log is in the repo.

But the payout math is deterministic. Regex and arithmetic, not a language model.
At settlement time, Mariana needs a number that's the same every single time,
that she can explain row by row to a skeptical tour manager.
AI should be classifying deal reads, flagging ambiguity, routing edge cases
for human review before the show — not deciding payouts.
That's the line, and it's intentional.

On what I cut: door deals, percentage-of-net, full AI extraction,
the agent communication portal, revision history. All real problems.
None of them are the first trust wedge.

The other slices I considered each lost on one axis —
dispute resolution treats the symptom, pre-show confirmation
has invisible payoff until the show runs, agent portal requires trust to exist first.

What ships next: pre-show confirm-deal-read — Mariana should catch
recoup ambiguity on Wednesday, not at 2am. Then revision history on disputed lines.
Then expand Vs to tier ratchets and walkout pots."

---

### CLOSE [5:45–6:05]

"195 Vs deals at The Crescent. The largest deal type. Zero in-app support before this.

The prototype gets Greenroom into the 2am trust conversation
for the 121 standard ones, while being honest about the 57 complex ones
it shouldn't automate yet.

That's the slice. That's why."

---

## Notes for recording

**Before you start:** Pull up the live app, read the actual dispute rate off the
Reports page, and confirm the $5,197.50 on show_0002 — say those numbers naturally
as they appear on screen, not from memory.

**Pacing:** Slower than you think. Pause after every number for one beat.
The viewer needs a second to process "$5,197.50" before you keep going.

**What not to do:** Don't describe what's on screen — they can read.
Say why it's there. "Greenroom reads the free-text note first" — not "this is the deal note field."

**If you stumble:** Keep going. Don't restart. A small stumble and a confident
recovery is a better PM signal than a flawless pitch.
