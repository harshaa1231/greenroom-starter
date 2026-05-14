/**
 * Deal calculation logic for the in-app settlement tool.
 *
 * IMPORTANT — DELIBERATELY INCOMPLETE.
 *
 * This is the existing Greenroom settlement engine. It was built early in
 * the company's life, when most deals were flat guarantees. It currently
 * handles two deal types end-to-end:
 *
 *   1. flat                 — $X guaranteed, optional sellout bonus
 *   2. percentage_of_gross  — X% of gross, no expense deductions, optional sellout bonus
 *
 * For both, it reads `bonusesJson` and applies bonuses where it can — but
 * only the structured ones. Bonuses that exist only in `dealNotesFreetext`
 * are invisible to this engine.
 *
 * It does NOT handle:
 *
 *   - vs deals (guarantee vs % of net, whichever greater)
 *   - percentage_of_net deals (with expense deductions)
 *   - door deals
 *   - recoups (those flow separately through the settlement record)
 *   - tier ratchets (would need vs-deal support first)
 *   - comps that count toward gross
 *
 * For unsupported deals, the tool returns { supported: false } and the UI
 * shows the "this deal type isn't yet supported" empty state. About 82% of
 * Greenroom's customers default to spreadsheets because of this.
 */

import type { Deal, Expense, TicketSale, Bonus, Recoup } from "@/db/schema";

type ReviewSeverity = "ok" | "watch" | "risk";

export type DealRead = {
  confidence: "ready" | "review" | "blocked";
  summary: string;
  terms: {
    label: string;
    value: string;
    source: "deal notes" | "structured field" | "system";
    note?: string;
  }[];
  flags: {
    severity: ReviewSeverity;
    label: string;
    detail: string;
  }[];
  assumptions: string[];
};

export type AuditRow = {
  label: string;
  value: number;
  source: string;
  note?: string;
  tone?: "default" | "positive" | "negative" | "warning";
};

export type VsDetails = {
  guarantee: number;
  percentage: number;
  basis: "net" | "gross";
  winner: "guarantee" | "percentage";
  percentageTake: number;
  splitBase: number;
  uncappedExpenses: number;
  appliedExpenses: number;
  absorbedOrCappedExpenses: number;
  expenseCap: number | null;
  recoupsApplied: number;
  disputedRecoups: number;
  recoupTreatment: "none" | "against_gross";
};

export type SettlementCalculation =
  | {
      supported: true;
      grossBoxOffice: number;
      netBoxOffice: number;
      totalExpenses: number;
      totalToArtist: number;
      steps: { label: string; value: number; note?: string }[];
      finalFormula: string;
      // Bonuses that were applied. Empty array if no bonuses on the deal,
      // or if no bonuses triggered.
      bonusesApplied: { label: string; amount: number; reason: string }[];
      // Bonuses that exist on the deal but didn't trigger (helpful context).
      bonusesNotTriggered: { label: string; amount: number; reason: string }[];
      calculationKind: "flat" | "percentage_of_gross" | "vs";
      dealRead?: DealRead;
      auditRows?: AuditRow[];
      vsDetails?: VsDetails;
    }
  | {
      supported: false;
      reason: string;
      dealType: Deal["dealType"];
      dealRead?: DealRead;
    };

interface CalcInput {
  deal: Deal;
  ticketSales: TicketSale[];
  expenses: Expense[];
  recoups?: Recoup[];
  // Capacity is needed to evaluate sellout bonuses. Optional — if omitted,
  // sellout bonuses are reported as "can't determine".
  venueCapacity?: number;
  ticketsSold?: number;
}

export function parseBonuses(deal: Deal): Bonus[] {
  if (!deal.bonusesJson) return [];
  try {
    const parsed = JSON.parse(deal.bonusesJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function calculateSettlement(input: CalcInput): SettlementCalculation {
  const {
    deal,
    ticketSales,
    expenses,
    recoups = [],
    venueCapacity,
    ticketsSold,
  } = input;

  const grossBoxOffice = ticketSales.reduce((sum, t) => sum + t.gross, 0);
  const totalFees = ticketSales.reduce((sum, t) => sum + t.fees, 0);
  const netBoxOffice = grossBoxOffice - totalFees;
  const totalExpenses = expenses
    .filter((e) => !e.absorbedByVenue)
    .reduce((sum, e) => sum + e.amount, 0);

  const tickets =
    ticketsSold ?? ticketSales.reduce((sum, t) => sum + (t.qty ?? 0), 0);

  // ---------- flat guarantee ----------
  if (deal.dealType === "flat") {
    if (deal.guaranteeAmount == null) {
      return {
        supported: false,
        reason: "Flat deal is missing a guarantee amount.",
        dealType: deal.dealType,
      };
    }
    const bonusResult = applyBonuses(parseBonuses(deal), {
      gross: grossBoxOffice,
      tickets,
      capacity: venueCapacity,
    });

    return {
      supported: true,
      grossBoxOffice,
      netBoxOffice,
      totalExpenses,
      totalToArtist: deal.guaranteeAmount + bonusResult.totalApplied,
      steps: [
        {
          label: "Flat guarantee",
          value: deal.guaranteeAmount,
          note: "No expense deductions. The guarantee is the floor.",
        },
        ...bonusResult.applied.map((b) => ({
          label: b.label,
          value: b.amount,
          note: b.reason,
        })),
      ],
      finalFormula: bonusResult.applied.length
        ? `flat ${deal.guaranteeAmount} + bonuses ${bonusResult.totalApplied} = ${(deal.guaranteeAmount + bonusResult.totalApplied).toFixed(2)}`
        : `flat guarantee = ${deal.guaranteeAmount}`,
      bonusesApplied: bonusResult.applied,
      bonusesNotTriggered: bonusResult.notTriggered,
      calculationKind: "flat",
    };
  }

  // ---------- percentage of gross ----------
  if (deal.dealType === "percentage_of_gross") {
    if (deal.percentage == null) {
      return {
        supported: false,
        reason: "Percentage-of-gross deal is missing a percentage.",
        dealType: deal.dealType,
      };
    }
    const payout = grossBoxOffice * deal.percentage;
    const bonusResult = applyBonuses(parseBonuses(deal), {
      gross: grossBoxOffice,
      tickets,
      capacity: venueCapacity,
    });

    return {
      supported: true,
      grossBoxOffice,
      netBoxOffice,
      totalExpenses,
      totalToArtist: payout + bonusResult.totalApplied,
      steps: [
        { label: "Gross box office", value: grossBoxOffice },
        {
          label: `× ${(deal.percentage * 100).toFixed(0)}%`,
          value: payout,
          note: "Percentage of gross — no expense deductions.",
        },
        ...bonusResult.applied.map((b) => ({
          label: b.label,
          value: b.amount,
          note: b.reason,
        })),
      ],
      finalFormula: bonusResult.applied.length
        ? `gross × ${deal.percentage} + bonuses = ${(payout + bonusResult.totalApplied).toFixed(2)}`
        : `gross × ${deal.percentage} = ${payout.toFixed(2)}`,
      bonusesApplied: bonusResult.applied,
      bonusesNotTriggered: bonusResult.notTriggered,
      calculationKind: "percentage_of_gross",
    };
  }

  // ---------- standard vs deal ----------
  if (deal.dealType === "vs") {
    const read = readVsDeal(deal);

    if (read.blockingReason) {
      return {
        supported: false,
        reason: read.blockingReason,
        dealType: deal.dealType,
        dealRead: read.dealRead,
      };
    }

    if (
      read.guarantee == null ||
      read.percentage == null ||
      read.percentage <= 0
    ) {
      return {
        supported: false,
        reason:
          "Vs deal is missing either the guarantee or artist percentage needed to settle it safely.",
        dealType: deal.dealType,
        dealRead: read.dealRead,
      };
    }

    const activeRecoups = recoups.filter((r) => r.status !== "withdrawn");
    const recoupsApplied = activeRecoups.reduce((sum, r) => sum + r.amount, 0);
    const disputedRecoups = activeRecoups
      .filter((r) => r.status === "disputed")
      .reduce((sum, r) => sum + r.amount, 0);
    const recoupTreatment =
      recoupsApplied > 0 && /against gross|off gross|before/i.test(read.notes)
        ? "against_gross"
        : "none";

    const appliedExpenses =
      read.basis === "net"
        ? Math.min(totalExpenses, read.expenseCap ?? totalExpenses)
        : 0;
    const absorbedOrCappedExpenses =
      read.basis === "net" ? Math.max(totalExpenses - appliedExpenses, 0) : 0;
    const recoupDeduction =
      recoupTreatment === "against_gross" ? recoupsApplied : 0;
    const splitBase =
      read.basis === "gross"
        ? grossBoxOffice - recoupDeduction
        : grossBoxOffice - totalFees - recoupDeduction - appliedExpenses;
    const percentageTake = splitBase * read.percentage;
    const bonusResult = applyBonuses(parseBonuses(deal), {
      gross: grossBoxOffice,
      tickets,
      capacity: venueCapacity,
    });
    const baseArtistTake = Math.max(read.guarantee, percentageTake);
    const totalToArtist = baseArtistTake + bonusResult.totalApplied;
    const winner = percentageTake >= read.guarantee ? "percentage" : "guarantee";

    if (disputedRecoups > 0) {
      read.dealRead.flags.push({
        severity: "risk",
        label: "Disputed recoup in the math",
        detail:
          "The recoup is visible in settlement data and should be resolved in writing before final sign-off.",
      });
      read.dealRead.confidence = "review";
    }

    if (recoupsApplied > 0 && recoupTreatment === "none") {
      read.dealRead.flags.push({
        severity: "watch",
        label: "Recoup exists without clear deduction order",
        detail:
          "Greenroom found a recoup line item, but the deal notes do not clearly say it comes off gross before the split.",
      });
      read.dealRead.confidence = "review";
    }

    const auditRows: AuditRow[] = [
      {
        label: "Gross box office",
        value: grossBoxOffice,
        source: "ticket sales",
        note: "Pulled from the integrated ticketing/POS summary.",
      },
      {
        label: "Less fees",
        value: -totalFees,
        source: "ticket sales",
        note: "Credit-card and platform fees before artist split.",
        tone: "negative",
      },
    ];

    if (recoupDeduction > 0) {
      auditRows.push({
        label: "Less recoups against gross",
        value: -recoupDeduction,
        source: "settlement recoups",
        note:
          disputedRecoups > 0
            ? "Included in the current venue read, but disputed by artist team."
            : "Applied before the percentage split per deal notes.",
        tone: disputedRecoups > 0 ? "warning" : "negative",
      });
    }

    if (read.basis === "net") {
      auditRows.push({
        label: "Less approved expenses",
        value: -appliedExpenses,
        source: "expense rows",
        note:
          read.expenseCap != null
            ? `Expense cap applied at ${currency(read.expenseCap)}.`
            : "No expense cap found in the deal read.",
        tone: "negative",
      });
    }

    auditRows.push(
      {
        label: `${Math.round(read.percentage * 100)}% artist split base`,
        value: splitBase,
        source: "calculated",
        note:
          read.basis === "gross"
            ? "Vs-gross read: no expense deduction before split."
            : "Gross minus fees, recoups, and capped expenses.",
      },
      {
        label: "Artist percentage take",
        value: percentageTake,
        source: "calculated",
        note: `${Math.round(read.percentage * 100)}% of split base.`,
        tone: winner === "percentage" ? "positive" : "default",
      },
      {
        label: "Guarantee floor",
        value: read.guarantee,
        source: read.guaranteeSource,
        note: "Artist receives the greater of guarantee or percentage take.",
        tone: winner === "guarantee" ? "positive" : "default",
      },
    );

    for (const bonus of bonusResult.applied) {
      auditRows.push({
        label: bonus.label,
        value: bonus.amount,
        source: "structured bonus",
        note: bonus.reason,
        tone: "positive",
      });
    }

    return {
      supported: true,
      grossBoxOffice,
      netBoxOffice,
      totalExpenses,
      totalToArtist,
      steps: auditRows.map((row) => ({
        label: row.label,
        value: row.value,
        note: row.note,
      })),
      finalFormula:
        winner === "percentage"
          ? `${Math.round(read.percentage * 100)}% × ${splitBase.toFixed(2)} beats ${read.guarantee.toFixed(2)} guarantee`
          : `${read.guarantee.toFixed(2)} guarantee beats ${Math.round(read.percentage * 100)}% × ${splitBase.toFixed(2)}`,
      bonusesApplied: bonusResult.applied,
      bonusesNotTriggered: bonusResult.notTriggered,
      calculationKind: "vs",
      dealRead: read.dealRead,
      auditRows,
      vsDetails: {
        guarantee: read.guarantee,
        percentage: read.percentage,
        basis: read.basis,
        winner,
        percentageTake,
        splitBase,
        uncappedExpenses: totalExpenses,
        appliedExpenses,
        absorbedOrCappedExpenses,
        expenseCap: read.expenseCap,
        recoupsApplied,
        disputedRecoups,
        recoupTreatment,
      },
    };
  }

  // ---------- everything else: not supported ----------
  const friendlyName: Record<Deal["dealType"], string> = {
    flat: "Flat guarantee",
    percentage_of_gross: "Percentage of gross",
    percentage_of_net: "Percentage of net",
    vs: "Vs deal (guarantee vs %)",
    door: "Door deal",
  };

  return {
    supported: false,
    dealType: deal.dealType,
    reason:
      `${friendlyName[deal.dealType]} deals aren't supported in the in-app tool yet. ` +
      `Power users at venues like The Crescent default to spreadsheets for these.`,
  };
}

function readVsDeal(deal: Deal): {
  notes: string;
  guarantee: number | null;
  guaranteeSource: string;
  percentage: number | null;
  basis: "net" | "gross";
  expenseCap: number | null;
  blockingReason?: string;
  dealRead: DealRead;
} {
  const notes = deal.dealNotesFreetext ?? "";
  const parsedGuarantee = parseMoneyBeforeVs(notes);
  const parsedPercentage = parsePrimaryPercentage(notes);
  const parsedExpenseCap = parseExpenseCap(notes);
  const basis =
    /gross|no expenses/i.test(notes) && !/after expenses/i.test(notes)
      ? "gross"
      : "net";
  const guarantee = parsedGuarantee ?? deal.guaranteeAmount;
  const percentage = parsedPercentage ?? deal.percentage;
  const expenseCap =
    basis === "gross" ? null : parsedExpenseCap ?? deal.expenseCap;
  const flags: DealRead["flags"] = [];
  const assumptions: string[] = [];

  if (parsedPercentage != null && deal.percentage != null) {
    const delta = Math.abs(parsedPercentage - deal.percentage);
    if (delta > 0.001) {
      flags.push({
        severity: "risk",
        label: "Structured percentage conflicts with deal notes",
        detail: `Structured field says ${percent(deal.percentage)}, but the trusted notes read as ${percent(parsedPercentage)}.`,
      });
    }
  }

  if (parsedExpenseCap != null && deal.expenseCap != null) {
    const delta = Math.abs(parsedExpenseCap - deal.expenseCap);
    if (delta > 1) {
      flags.push({
        severity: "risk",
        label: "Structured expense cap conflicts with deal notes",
        detail: `Structured field says ${currency(deal.expenseCap)}, but the trusted notes read as ${currency(parsedExpenseCap)}.`,
      });
    }
  }

  if (/renegotiated|updated|note added/i.test(notes)) {
    flags.push({
      severity: "watch",
      label: "Deal changed after first entry",
      detail:
        "The notes indicate a renegotiation or later clarification, so the settlement should make the final read explicit.",
    });
  }

  if (/recoup/i.test(notes)) {
    flags.push({
      severity: "watch",
      label: "Recoup language present",
      detail:
        "Recoups are a common dispute source. The settlement needs to show whether they are inside or outside the expense cap.",
    });
  }

  if (/bonus/i.test(notes) && !deal.bonusesJson) {
    flags.push({
      severity: "watch",
      label: "Bonus mentioned only in notes",
      detail:
        "The deal mentions a performance bonus, but no structured bonus exists for the calculator to evaluate.",
    });
  }

  const complexVariant =
    /walkout|ratchet|escalator/i.test(notes) || /tier/i.test(notes);
  if (complexVariant) {
    flags.push({
      severity: "risk",
      label: "Complex Vs variant",
      detail:
        "Walkout pots, tier ratchets, and escalators can materially change payout and are intentionally left out of this slice.",
    });
  }

  if (basis === "gross") {
    assumptions.push("No regular expenses are deducted before the artist split.");
  } else if (expenseCap != null) {
    assumptions.push(
      `Approved expenses count up to the ${currency(expenseCap)} cap.`,
    );
  } else {
    assumptions.push(
      "No expense cap was found, so all passed-through expenses are counted.",
    );
  }

  if (/against gross/i.test(notes)) {
    assumptions.push(
      "Recoups described as 'against gross' are deducted before the split.",
    );
  }

  const confidence = complexVariant
    ? "blocked"
    : flags.some((f) => f.severity === "risk")
      ? "review"
      : "ready";

  const dealRead: DealRead = {
    confidence,
    summary:
      confidence === "blocked"
        ? "Greenroom can read the base terms, but this variant still needs manual modeling."
        : `Greenroom reads this as ${currency(guarantee)} guarantee vs ${percent(percentage)} of ${basis}.`,
    terms: [
      {
        label: "Guarantee",
        value: currency(guarantee),
        source: parsedGuarantee != null ? "deal notes" : "structured field",
      },
      {
        label: "Artist split",
        value: percent(percentage),
        source: parsedPercentage != null ? "deal notes" : "structured field",
      },
      {
        label: "Basis",
        value: basis === "gross" ? "Gross" : "Net after expenses",
        source: "deal notes",
      },
      {
        label: "Expense cap",
        value: basis === "gross" ? "No expenses" : currency(expenseCap),
        source:
          parsedExpenseCap != null
            ? "deal notes"
            : deal.expenseCap != null
              ? "structured field"
              : "system",
      },
    ],
    flags,
    assumptions,
  };

  return {
    notes,
    guarantee,
    guaranteeSource: parsedGuarantee != null ? "deal notes" : "structured field",
    percentage,
    basis,
    expenseCap,
    blockingReason: complexVariant
      ? "This Vs deal includes a walkout pot, tier ratchet, or escalator. This prototype reads the base terms, but intentionally leaves those complex variants for the next slice."
      : undefined,
    dealRead,
  };
}

function parseMoneyBeforeVs(notes: string): number | null {
  const beforeVs = notes.split(/\bvs\b/i)[0] ?? notes;
  const dollarAmount = beforeVs.match(
    /\$\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:\.\d+)?/,
  );
  if (dollarAmount) return Number(dollarAmount[1].replace(/,/g, ""));

  const guaranteeAmount = beforeVs.match(
    /([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:\.\d+)?\s*(?:g'tee|guarantee)/i,
  );
  return guaranteeAmount ? Number(guaranteeAmount[1].replace(/,/g, "")) : null;
}

function parsePrimaryPercentage(notes: string): number | null {
  const split = notes.match(/\b([0-9]{2})\s*\/\s*[0-9]{2}\b/);
  if (split) return Number(split[1]) / 100;

  const percentMatch = notes.match(/\b([0-9]{2})\s*%\b/);
  if (percentMatch) return Number(percentMatch[1]) / 100;

  return null;
}

function parseExpenseCap(notes: string): number | null {
  const cap = notes.match(
    /expenses?\s*(?:capped|cap|to|up to|capped at)?\s*(?:at)?\s*\$?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)/i,
  );
  if (cap) return Number(cap[1].replace(/,/g, ""));
  return null;
}

function currency(value: number | null | undefined): string {
  if (value == null) return "Not found";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function percent(value: number | null | undefined): string {
  if (value == null) return "Not found";
  return `${Math.round(value * 100)}%`;
}

/** Evaluate a list of bonuses against the show's actual numbers. */
function applyBonuses(
  bonuses: Bonus[],
  ctx: { gross: number; tickets: number; capacity?: number },
) {
  const applied: { label: string; amount: number; reason: string }[] = [];
  const notTriggered: { label: string; amount: number; reason: string }[] = [];

  for (const b of bonuses) {
    if (b.type === "gross_threshold") {
      if (ctx.gross >= b.threshold) {
        applied.push({
          label: b.label,
          amount: b.amount,
          reason: `Gross ${ctx.gross.toLocaleString()} ≥ ${b.threshold.toLocaleString()}`,
        });
      } else {
        notTriggered.push({
          label: b.label,
          amount: b.amount,
          reason: `Gross ${ctx.gross.toLocaleString()} < ${b.threshold.toLocaleString()}`,
        });
      }
    } else if (b.type === "sellout") {
      if (ctx.capacity != null && ctx.tickets >= ctx.capacity * 0.95) {
        applied.push({
          label: b.label,
          amount: b.amount,
          reason: `${ctx.tickets} of ${ctx.capacity} sold`,
        });
      } else {
        notTriggered.push({
          label: b.label,
          amount: b.amount,
          reason:
            ctx.capacity != null
              ? `${ctx.tickets} of ${ctx.capacity} sold (sellout = ≥95%)`
              : `Capacity unknown — can't evaluate`,
        });
      }
    } else if (b.type === "attendance_threshold") {
      if (ctx.tickets >= b.threshold) {
        applied.push({
          label: b.label,
          amount: b.amount,
          reason: `${ctx.tickets} ≥ ${b.threshold}`,
        });
      } else {
        notTriggered.push({
          label: b.label,
          amount: b.amount,
          reason: `${ctx.tickets} < ${b.threshold}`,
        });
      }
    } else if (b.type === "tier_ratchet") {
      // Tier ratchets fundamentally change the percentage structure. The
      // current engine only supports flat % of gross — we can't apply a
      // ratcheting structure on top of it without knowing which deal type
      // it's modifying. Report as not-applicable.
      notTriggered.push({
        label: b.label,
        amount: 0,
        reason: "Tier ratchets need vs-deal or % of net support — not yet handled",
      });
    }
  }

  return {
    applied,
    notTriggered,
    totalApplied: applied.reduce((s, b) => s + b.amount, 0),
  };
}
