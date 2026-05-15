# Loom Script — Greenroom Settlement Trust Layer
# Target: 6–7 minutes | Audience: Technical + Non-technical

---

## Before you hit record

Have these tabs open and ready:
- Tab 1: http://localhost:3000/reports
- Tab 2: http://localhost:3000/shows/show_coastal_spell_dispute/settle
- Tab 3: http://localhost:3000/shows/show_0002/settle
- Tab 4: http://localhost:3000/shows/show_0007/settle

Browser zoom at 90%. No other tabs visible.

---

## [0:00–0:30] The one-line pitch

Start on a blank screen or your face. Do NOT open the app yet.

> "Settlement at a live music venue sounds simple — show happens, artist gets paid.
> But at The Crescent in Nashville, 82% of deals can't be settled inside Greenroom.
> Mariana, the lead booker, runs the actual math in a Google Sheet at 2am after every show,
> exports a PDF, and emails it to the tour manager.
> Tonight I'm going to show you what I built to change that — and more importantly,
> why I picked this slice and not the four other things I could have built."

---

## [0:30–1:00] Show the problem with real numbers

Navigate to **Tab 1: /reports**

Point to the Settlement Craft Gap section — the two large numbers.

> "This is the Reports page. Two numbers tell the whole story.
> Eighty-two percent of deals at The Crescent are types the in-app tool
> can't settle — Vs deals, percentage-of-net, door deals.
> And the disputed settlement rate sits at [read it off screen]%.
> The CEO called this the company's biggest craft gap in her Q4 memo.
> That's the problem."

Scroll down slowly to the **Deal Mix** chart.

> "Look at the deal mix. Vs deals are the single largest type — 36% of all deals.
> Before this build, every bar except flat and percentage-of-gross said 'spreadsheet.'
> Vs deals now say 'standard: in tool.' I'll show you what that means in a second."

Scroll further to the **Trust Layer Signals** section.

> "And this section — Trust Layer Signals — is the most important thing I found
> in the data. [Read the conflict number off screen] settlements in this history
> are marked Disputed in the system, but the artist's own sign-off message says
> things like 'Looks good' or 'OK. Good night.'
> The status badge and what the artist actually wrote contradict each other.
> The product I built catches that. Let me show you."

---

## [1:00–3:00] Coastal Spell — the messy case that shaped the design

Navigate to **Tab 2: /shows/show_coastal_spell_dispute/settle**

Let the page load. The red gradient and Disputed badge should be visible.

> "This is the Coastal Spell settlement. The brief specifically calls this out —
> a show where a $900 marketing recoup was disputed by WME, ended in a $720
> concession, and left everyone with a bad taste.
> This is the scenario the trust layer is designed for."

Point to the **Disputed callout banner** at the top (red box).

> "The first thing you see is a callout: one recoup in dispute, $900 contested.
> Mariana knows before she opens the worksheet that there's a live disagreement
> she needs to surface — not hide."

Point to the **Deal Read panel**.

> "Now here's the core of what I built. This is the Deal Read panel.
> Greenroom reads the free-text deal note first — the thing Mariana
> actually trusts — then checks it against the structured fields in the database.
> Every term has a source tag: 'deal notes' or 'structured field' or 'system.'
> This matters because the brief explicitly warns that structured fields drift
> away from what was actually agreed."

Point to the **flag cards** on the right side of Deal Read.

> "See these flags? The yellow one says 'Recoup language present' — it tells Mariana
> that recoups are a common dispute source and the settlement needs to show
> whether they're inside or outside the expense cap.
> The status shows 'Needs Review,' not 'Ready to settle,' because of the disputed recoup."

> "For non-technical folks: think of this as Greenroom telling Mariana —
> 'Here's what I think the deal says, here's where I got each number from,
> and here are the things that could start an argument.'
> At 2am with a tour manager at the table, that's exactly what she needs."

Scroll down to the **Settlement Worksheet / Audit Rows**.

> "The worksheet below is the math, row by row.
> Gross box office — source: ticket sales.
> Less fees — source: ticket sales.
> Less the marketing recoup against gross — source: settlement recoups,
> and it's flagged amber because it's disputed.
> Then the split base, the percentage take, the guarantee floor.
> Every row is tagged so a tour manager can point at any line and ask
> 'where did that come from?' and Mariana has an answer."

Scroll to **Sign-off & notes** at the bottom.

> "And here's the data finding that nobody would catch by just using the UI.
> The system shows this settlement as Disputed.
> But scroll to the sign-off: the artist team wrote
> 'OK — but flag any future marketing recoup deals.'
> That's an approval with a note, not a rejection.
> Greenroom now reads both fields and surfaces this amber conflict warning:
> 'Status/sign-off conflict — the system says Disputed but the artist team
> communicated approval. Reconcile this before closing.'
> That's the 24-settlement pattern I found in the database, made actionable."

---

## [3:00–4:00] Happy path — standard Vs deal now settles in-app

Navigate to **Tab 3: /shows/show_0002/settle**

> "Now the other side. This is Sunday Drivers. Standard Vs deal —
> $1,405 guarantee versus 90% of net after expenses, capped at $700.
> Before this build, this show fell into the unsupported empty state.
> Mariana would open her spreadsheet."

Point to the **Deal Read panel — green, 'Ready to settle'**.

> "Deal Read is green. Greenroom parsed the free-text note, found the guarantee,
> found the 90%, found the expense cap, checked them against the structured fields —
> they agree. No conflicts, no flags. Ready to settle."

Point to the **hero number** — the large dollar amount.

> "Total to artist: [read off screen]. That number came from the in-app engine —
> not Mariana's spreadsheet.
> And you can see the worksheet below: percentage take was [X], guarantee was $1,405,
> percentage won. Source-tagged, auditable."

Point to the **VsTrustSummary cards** — deal outcome, expense treatment, recoup posture.

> "These three cards above the worksheet are the trust summary.
> Which leg of the deal won — percentage or guarantee.
> How expenses were treated — capped at $700 in this case.
> Recoup posture — nothing extra deducted.
> These answer the three questions a tour manager asks at 2am
> before they'll wire money."

Point to the **Submit to artist team button** in the Deal Read panel.

> "And this button works. When the deal read is clean and the settlement is in draft,
> Mariana can hit 'Submit to artist team' and it transitions the settlement to
> submitted status — no spreadsheet export, no manual email.
> That's the start of bringing the 2am walkthrough into the product."

*[Optional: click the button and show the page reload with the lifecycle bar advancing to 'Submitted']*

---

## [4:00–4:30] The honest block — complex variant

Navigate to **Tab 4: /shows/show_0007/settle**

> "Briar Road. Also a Vs deal. But this one has a walkout pot — after breakeven
> on the guarantee plus expenses, all incremental gross goes to the artist.
> That's a fundamentally different payout structure."

Point to the **Deal Read — 'Manual model' badge, blocked**.

> "Greenroom reads the base terms and flags the complex variant.
> Then it refuses to run the math.
> That's intentional. I could have built a calculator that gets this partly right —
> but a confident number that's wrong by thousands of dollars is worse than
> an honest 'this needs manual modeling.'
> A settlement tool earns trust by knowing what it can't yet settle."

---

## [4:30–5:15] Where AI fits — and where it doesn't

Stay on the page or go back to the Deal Read on Coastal Spell.

> "I want to be direct about the AI usage in this build, because this is an
> Applied AI PM role and that question matters.
>
> I used Claude Code throughout the build — to read the case study PDF,
> to query the database directly and surface the 24-settlement data finding,
> to implement the Vs calculation engine, to generate the UI structure.
> The AI usage log in the repo documents every prompt and what I used from it.
>
> But the product decisions were mine: which slice, which cuts, the principle
> that the payout math stays deterministic. The deal read engine parses free text
> with regex — not an LLM — because at settlement time the math needs to be
> inspectable and repeatable. An LLM should propose a deal read, detect ambiguity,
> and route edge cases for human review. It should never silently decide a payout.
> That's the line I drew and I can defend it."

---

## [5:15–6:00] Trade-offs, cuts, and what ships next

> "I cut door deals, percentage-of-net, comps toward gross, receipt attachments,
> revision history, and full AI extraction. Not because they don't matter —
> because none of them is the first trust wedge.
>
> The other candidate slices each lost on one axis:
> Dispute resolution is a symptom — the cause is an unreadable deal at 2am.
> Pre-show deal confirmation is the right long-term play but the payoff is
> invisible until the show runs.
> Agent portal requires trust to exist first.
>
> What ships next, in order:
> First — a pre-show confirm-deal-read step. Mariana should resolve recoup
> ambiguity on Wednesday, not at 2am Friday.
> Second — revision history on disputed line items. Coastal Spell needed
> a record of the venue read, WME's read, and the concession.
> Third — expand Vs: vs-gross, then tier ratchets, then walkout pots."

---

## [6:00–6:20] Close

> "The thesis is simple. Settlement at The Crescent is a trust conversation,
> not a math problem. Mariana already knows how to do the math.
> The product needs to make the deal read, the deduction order, and the
> source trail visible enough that Diego can sign at 2am and Sarah doesn't
> have to re-litigate it Monday morning.
>
> This prototype gets Greenroom into that conversation for the most common
> unsupported deal type — while being honest about the messy cases
> it shouldn't automate yet. That's the slice I picked and that's why."

---

## Anchor numbers to have ready (paste into a sticky note before recording)

Pull these from the running app before you hit record:

- Reports → craft gap percentage (unsupported deals %)
- Reports → disputed settlement rate
- Reports → Trust Layer Signals → status/signoff conflict count
- show_0002 → total to artist number
- show_0002 → which leg won (guarantee or percentage)

---

## Delivery notes

- Speak to the camera or screen, not both simultaneously.
- When navigating between tabs, say the route out loud: "I'll jump to the settle page for Coastal Spell."
- Pause briefly when pointing to a UI element — give it 1 second before explaining.
- You do not need to read every line on screen. The UI is readable. Talk about WHY it's there.
- If you stumble, keep going. A clean idea said slightly roughly beats a polished non-answer.
- Do one full run-through without recording first to nail the tab order and timing.
