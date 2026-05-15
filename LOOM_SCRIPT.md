# Loom Script — Greenroom Settlement Trust Layer
# Runtime: 6–7 minutes

---

## Setup before you hit record

Open four tabs, in this order:
1. http://localhost:3000/reports
2. http://localhost:3000/shows/show_coastal_spell_dispute/settle
3. http://localhost:3000/shows/show_0002/settle
4. http://localhost:3000/shows/show_0007/settle

Browser at 90% zoom. No other tabs visible. Pull these numbers from the
live app and write them on a sticky note — you'll need them during the recording:

- Reports page: the "Deals unsupported by tool" percentage
- Reports page: the disputed settlement rate
- Reports page: the status/signoff conflict count (Trust Layer Signals section)
- show_0002 settle page: the total to artist number

---

## THE SCRIPT

---

### INTRO [0:00–0:45] — Start on your face, no screen yet

"Imagine it's 2am. A show just wrapped at a 650-capacity venue in Nashville.
The artist's tour manager is standing at the merch table, waiting to get paid
and get on the bus.

The booker — her name is Mariana — pulls out her laptop, opens a Google Sheet
she's used for three years, manually punches in the ticket numbers, the expenses,
the deal terms from the contract PDF, and tries to produce a number that the
tour manager will actually trust enough to sign off on tonight.

If they don't agree — if the tour manager looks at the number and says
'I don't think the marketing recoup should come off the top before our split' —
that show doesn't close tonight. It becomes an email thread on Monday morning.
It becomes a dispute. It becomes a damaged relationship with the agent.

That is the actual problem. Not the math. The trust.

I'm Harsha, and for this case study I picked one slice of that problem,
went as deep as I could in the time, and built a working prototype inside
the Greenroom codebase. This is that walkthrough."

[Now share screen. Navigate to Tab 1: /reports]

---

### ACT 1: THE PROBLEM IN NUMBERS [0:45–1:45]

[Let the Reports page settle. Don't click anything yet — let them read it for a second.]

"Before I show you what I built, I want to show you the problem in the data.
This is the Reports page — real aggregated metrics from The Crescent's show history."

[Point to the Settlement Craft Gap section — the two large numbers side by side]

"Two numbers. On the left: the percentage of deals the in-app tool
literally cannot settle. On the right: the disputed settlement rate.

[Read both numbers off screen as you say:]
That first number — [X]% — means that for [X] out of every 10 shows,
Mariana is doing the math in a spreadsheet, not in Greenroom.
The CEO called this the company's biggest craft gap. It's right there
in her Q4 memo at the top of this page.

That's the company's own words about their own product."

[Scroll slowly to the Deal Mix chart]

"Now look at this. Deal mix by type. Each bar is a deal type
and whether the tool can handle it.

Before this build, everything except flat guarantees and percentage-of-gross
said 'spreadsheet' in amber.

Vs deals — guarantee vs percentage, whichever is greater — are the single
largest deal type. 36% of all deals. And the tool couldn't touch them.

You'll notice the Vs bar now says 'standard: in tool' in green.
That's what I built. But let me show you the other thing I found first,
because it's more interesting."

[Scroll down to Trust Layer Signals]

"I queried the database directly — not just the UI, the actual SQLite file —
before writing a single line of code.

And I found this. [Read the conflict number off screen] settlements in The Crescent's
history are marked 'Disputed' in the system — but the artist team's own
sign-off message says things like 'Looks good' or 'OK. Good night.'

The status badge and what the artist actually wrote are contradicting each other.
The product's surface says one thing. The data says another.

That's not a minor data quality issue. That's a booker looking at 'Disputed'
on a show that the artist team already approved, and not knowing which one to trust.

The product I built catches this. Let me show you where."

---

### ACT 2: THE MESSY CASE [1:45–3:30]

[Navigate to Tab 2: /shows/show_coastal_spell_dispute/settle]

[Pause for 2 seconds as the page loads — the red gradient, the Disputed badge,
the Disputed callout banner should all be visible before you speak]

"This is the Coastal Spell settlement. The case study brief specifically
calls this show out as the example of what goes wrong.

A $900 marketing recoup. WME disputed it. Marcus at the venue made a $720 concession
to keep the relationship. The show closed — but barely, and not cleanly.

This is what a broken settlement trust loop looks like after it breaks.
I want to show you what it could look like if the product had surfaced
this ambiguity at the right time."

[Point to the red Disputed callout banner at the top]

"First thing Mariana sees: one recoup in dispute, $900 contested.
Not buried in a notes field. Front and center, before anything else.

For non-technical folks: think of this like a transaction that's been flagged
before you even open it — not discovered halfway through."

[Scroll to the Deal Read panel]

"This is the new piece. The Deal Read panel.

Here's the core product decision I made: the free-text deal note —
the thing Mariana actually wrote in her own words when she booked the show —
is treated as the source of truth. The structured database fields are checked
against it. Not the other way around.

The brief warns explicitly that structured fields drift over time.
Prose contradicts numbers. This is the product response to that.

Every term has a source tag underneath it: 'deal notes', 'structured field', or 'system.'
If the structured field says 60% but the deal note says 65%, you'll see a red flag
that says 'Structured percentage conflicts with deal notes.'

You're not trusting the badge. You're reading the actual record."

[Point to the flag cards on the right side of the Deal Read panel]

"The flags here: 'Recoup language present' — watch this one.
'Deal changed after first entry' — there was a note added after the original deal.
These tell Mariana which assumptions a tour manager might challenge,
before the tour manager opens their mouth.

The confidence badge says 'Needs Review.' Not 'Ready to settle.'
The math can run, but this settlement should not go out without Mariana
explicitly acknowledging these flags."

[Scroll down to the Settlement Worksheet]

"The worksheet. Row by row.

Gross box office — source: ticket sales.
Less fees — source: ticket sales.
Less the marketing recoup against gross — source: settlement recoups.
That row is amber because it's the disputed one. The number is in the math,
but it's visually called out so everyone at the table can see exactly
where the deduction entered.

Then the split base. The percentage take. The guarantee floor.
The system tells you which one wins.

For a technical person: every row maps back to a specific data source
so there's no ambiguity in the audit trail.
For a non-technical person: this is the product saying
'I'll show you every step, and I'll tell you where each number came from,
so nobody has to trust a black box at 2am.'"

[Scroll to Sign-off & notes at the bottom]

"And here's the 24-settlement finding, live in the product.

The system status: Disputed.
The artist team's actual message: 'OK — but flag any future marketing recoup deals.'

That's an approval with a note. Not a dispute.

Greenroom now reads both the status field and the sign-off text and
surfaces this amber conflict box: 'Status/sign-off conflict —
the system says Disputed but the artist team communicated approval.
Reconcile this before closing.'

Before this, a booker would look at the badge, see Disputed,
and have no idea that the artist team had already moved on."

---

### ACT 3: THE HAPPY PATH [3:30–4:30]

[Navigate to Tab 3: /shows/show_0002/settle]

"Now the clean case. Sunday Drivers.
Same deal type — Vs. $1,405 guarantee versus 90% of net after expenses,
expenses capped at $700.

Before this build: unsupported. Empty state. Open the spreadsheet."

[Let the page load. Point to the green Deal Read panel]

"Deal Read is green. 'Ready to settle.'

Greenroom found the guarantee in the deal note — '$1,405 guarantee.'
Found the 90% — '90% of net after expenses.'
Found the $700 expense cap.
Checked them against the structured database fields.
They agree. No conflicts. Clean read."

[Point to the hero number — the large dollar figure]

"Total to artist: [read the number]. That came out of the in-app engine.
Not a spreadsheet.

And you can see below: percentage take was higher than the guarantee,
so percentage wins. That decision is explicit, not implied."

[Point to the three VsTrustSummary cards]

"These three cards answer the three questions a tour manager asks
before they'll wire money.

Which leg of the deal won — percentage or guarantee, and by how much.
How expenses were treated — capped at $700 in this case.
Recoup posture — nothing extra applied, nothing disputed.

If all three cards are clean, Mariana can walk the tour manager through them
in 90 seconds."

[Point to the Submit to artist team button]

"And this button works.

When the deal read is clean and the settlement is still in draft,
Mariana hits this and it transitions the settlement to 'submitted' status —
the lifecycle bar advances, the artist team is next.

No PDF export. No manual email. The collaboration starts inside the product."

[Click the button if you want to show it live — page reloads and lifecycle bar advances]

---

### ACT 4: THE HONEST BLOCK [4:30–5:00]

[Navigate to Tab 4: /shows/show_0007/settle]

"Briar Road. Also a Vs deal. But this one has a walkout pot.

After breakeven on the guarantee plus expenses, all incremental gross
goes to the artist. That changes the math in a way that needs
a completely separate modeling pass.

Greenroom reads the base terms. Sees the walkout pot. And refuses to calculate."

[Point to the 'Manual model' badge on the Deal Read panel]

"This is intentional. I could have built a calculator that gets this 80% right.
But an 80%-right number at settlement — used to pay someone — is worse
than an honest 'this needs manual modeling.'

A settlement tool earns trust by being clear about what it can't yet handle.
That's not a limitation. That's the product taste."

---

### ACT 5: THE AI FRAMING [5:00–5:45]

[Stay on screen or switch to face. Keep it conversational — this is the most important section for the PM evaluation.]

"I want to be direct about where AI fits in this build, because it's an
Applied AI PM role and that question is worth answering clearly.

I built this with Claude Code. The AI read the brief PDFs, queried the database
and surfaced the 24-settlement finding I showed you, wrote the Vs calculation engine,
built the UI. The full prompt log is in the repo — every prompt, what I used,
what I didn't.

But the product decisions were mine: which slice, which cuts,
which edge cases get blocked.

And the payout math is deterministic. It's regex and arithmetic, not a language model.

Here's why that matters: at settlement time, the math needs to be
the same number every time. Inspectable. Auditable. Explainable to a tour manager
who doesn't trust software at 2am.

The right job for AI in this product — and what I'd build next —
is deal read classification: detect whether a free-text note is a standard Vs,
a complex variant, or something genuinely ambiguous. Route the ambiguous ones
for human review before the show, not during.

AI proposes. AI flags. AI routes.
Humans decide the payout. That's the line."

---

### ACT 6: CUTS AND WHAT'S NEXT [5:45–6:20]

"What I cut, and why.

Door deals, percentage-of-net, comps toward gross, receipt attachments,
revision history, full AI extraction, the agent communication portal.

None of those are wrong ideas. They're just not the first trust wedge.

The other slices I considered each lost on one axis.
Dispute resolution treats the symptom — the cause is an unreadable deal at 2am.
Pre-show deal confirmation is the right long-term play but the payoff
is invisible until the show runs. Agent portal requires trust to exist first.

What ships next, in order.

First: pre-show confirm-deal-read. Mariana should resolve recoup ambiguity
on Wednesday, not at 2am Friday. The conflict detection is already built —
surface it earlier.

Second: revision history on disputed line items. Coastal Spell needed
a record of the venue read, WME's read, and the concession.
Right now that lives in email.

Third: expand Vs — vs-gross, then tier ratchets, then walkout pots.
That order grows coverage while preserving the trust contract."

---

### CLOSE [6:20–6:40]

[Back to face if you can]

"Settlement at The Crescent is a trust conversation.
Mariana knows how to do the math. The product needs to make
the deal read, the deduction order, and the source trail visible enough
that someone can sign at 2am and not have to re-litigate it Monday morning.

This prototype gets Greenroom into that conversation for the most common
unsupported deal type — while being honest about the messy cases
it shouldn't automate yet.

That's the slice. That's why."

---

## Delivery notes — read before recording

**On pace:** This script runs 6:30 at a natural pace. Don't rush the pauses.
When you navigate between tabs, say the show name out loud so the viewer tracks.

**On the intro:** Say it without looking at your screen. You're setting up a
human scenario, not a product demo. Look at the camera for the first 45 seconds.

**On the numbers:** When you say "[X]%" — actually read the number off the live page.
That's why you have the sticky note. Don't say "some large percentage."

**On the technical sections:** Don't over-explain the code.
"Regex and arithmetic, not a language model" is enough.
If a technical reviewer wants more, the code is in the repo.

**On stumbles:** Keep going. One clean run through is better than ten perfect takes.
This role is about judgment under pressure — a tiny stumble and a confident recovery
is actually a better signal than a rehearsed pitch.

**What to NOT do:** Don't narrate what's on screen. The screen is readable.
Say WHY something is there, not WHAT it is.
"This is the gross box office" — bad.
"Greenroom pulls this from the ticketing integration so Mariana
doesn't have to type it in" — good.
