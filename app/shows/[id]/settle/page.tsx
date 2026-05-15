import Link from "next/link";
import { notFound } from "next/navigation";
import { submitSettlement } from "./actions";
import {
  ArrowLeft,
  FileWarning,
  ArrowRight,
  Check,
  AlertTriangle,
  Mail,
  Pencil,
  XCircle,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { getShowById } from "@/lib/queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Field,
} from "@/components/ui/card";
import { StatusBadge, DealTypeBadge, PlainBadge } from "@/components/ui/badge";
import { calculateSettlement } from "@/lib/dealMath";
import type { AuditRow, DealRead, VsDetails } from "@/lib/dealMath";
import {
  formatMoney,
  formatShowDateFull,
} from "@/lib/format";
import type { Settlement, Recoup } from "@/db/schema";
import { Logomark } from "@/components/brand/logo";

const RECOUP_LABELS: Record<Recoup["category"], string> = {
  marketing: "Marketing",
  hospitality_overage: "Hospitality overage",
  production_overage: "Production overage",
  prior_advance: "Prior advance",
  damages: "Damages",
  other: "Other",
};

export default async function SettlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getShowById(id);
  if (!data) notFound();

  const { show, artist, deal, ticketSales, expenses, settlement, recoups } =
    data;

  if (!deal) {
    return (
      <div className="px-12 py-10 max-w-4xl">
        <BackLink showId={show.id} />
        <div className="text-[13px] text-ink-400">
          No deal entered for this show. Settlement can&apos;t run yet.
        </div>
      </div>
    );
  }

  const calc = calculateSettlement({
    deal,
    ticketSales,
    expenses,
    recoups,
    venueCapacity: data.venue?.capacity ?? undefined,
  });
  const grossSoFar = ticketSales.reduce((sum, t) => sum + t.gross, 0);
  const totalFees = ticketSales.reduce((sum, t) => sum + t.fees, 0);
  const totalExpenses = expenses
    .filter((e) => !e.absorbedByVenue)
    .reduce((sum, e) => sum + e.amount, 0);

  const disputedRecoups = recoups.filter((r) => r.status === "disputed");
  const isDisputed = settlement?.status === "disputed" || settlement?.status === "revised" || !!settlement?.disputedAt;
  const disputedRecoupValue = disputedRecoups.reduce((s, r) => s + r.amount, 0);

  return (
    <div className={`px-12 py-10 max-w-7xl ${isDisputed ? "bg-gradient-to-b from-rose-50/30 via-canvas to-canvas" : ""}`}>
      <BackLink showId={show.id} />

      <div className="mb-20 animate-fade-up">
        <div className="flex items-center gap-1.5 mb-4">
          <StatusBadge status={show.status} />
          <DealTypeBadge type={deal.dealType} />
          {settlement?.status === "disputed" && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-medium ring-1 ring-inset bg-rose-50 text-rose-800 ring-rose-200/80">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
              </span>
              Disputed
            </span>
          )}
          {settlement?.status === "voided" && (
            <PlainBadge variant="default">Voided</PlainBadge>
          )}
        </div>
        <h1 className="font-display text-[48px] font-medium text-ink-900 leading-[1.05]" style={{ letterSpacing: "-0.02em", fontOpticalSizing: "auto" }}>
          Settlement · {artist?.name}
        </h1>
        <div className="text-[14px] text-ink-400 mt-3">
          {formatShowDateFull(show.date)}
        </div>
      </div>

      {/* Disputed callout */}
      {isDisputed && disputedRecoupValue > 0 && (
        <div className="mb-8 rounded-lg border border-rose-200/60 bg-rose-50/40 p-5 flex gap-3 animate-fade-up-1">
          <AlertTriangle className="h-4 w-4 text-rose-700 mt-0.5 shrink-0" />
          <div>
            <div className="text-[13px] font-semibold text-rose-800">
              {disputedRecoups.length} recoup{disputedRecoups.length === 1 ? "" : "s"} in dispute · {formatMoney(disputedRecoupValue)} contested
            </div>
            <p className="text-[12.5px] text-ink-600 mt-1 leading-relaxed">
              The artist team has flagged recoup line items. This settlement cannot be finalized until the dispute is resolved.
            </p>
          </div>
        </div>
      )}

      {settlement && (
        <div className="animate-fade-up-1">
          <LifecycleBar settlement={settlement} disputedRecoups={disputedRecoups.length} />
        </div>
      )}

      <div className="space-y-6 mt-6 animate-fade-up-2">
        {!calc.supported ? (
          <UnsupportedDeal
            dealType={calc.dealType}
            dealRead={calc.dealRead}
            deal={deal}
            existingSettlement={settlement}
            grossSoFar={grossSoFar}
            totalFees={totalFees}
            totalExpenses={totalExpenses}
            ticketCount={ticketSales.reduce((s, t) => s + (t.qty ?? 0), 0)}
            expenseRowCount={expenses.length}
          />
        ) : (
          <SupportedSettlement
            calc={calc}
            existingSettlement={settlement}
            submitAction={submitSettlement.bind(null, show.id)}
          />
        )}

        {recoups.length > 0 && <RecoupsSection recoups={recoups} />}

        {settlement && (settlement.signoffText || settlement.notes) && (
          <SignoffSection settlement={settlement} isDisputed={isDisputed} />
        )}
      </div>

      <div className="mt-16 pt-10 border-t border-ink-200/60">
        <div className="flex gap-4 items-start max-w-3xl">
          <Logomark size={40} className="shrink-0" />
          <div>
            <h2 className="font-display text-[20px] font-medium text-ink-900 mb-2" style={{ letterSpacing: "-0.02em" }}>
              You&apos;re looking at the seam this case study is about.
            </h2>
            <p className="text-[13px] text-ink-500 leading-relaxed">
              Greenroom&apos;s in-app settlement tool was built early in the
              company&apos;s history, when most deals were flat guarantees.
              About 18% of customers actively use it; the other 82% — including
              most of the larger venues — default to spreadsheets. The CEO has
              flagged this as the company&apos;s biggest craft gap.{" "}
              <Link
                href="/context"
                className="text-brand-700 font-medium hover:text-brand-800 hover:underline inline-flex items-center gap-0.5"
              >
                Where to start <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackLink({ showId }: { showId: string }) {
  return (
    <Link
      href={`/shows/${showId}`}
      className="inline-flex items-center gap-1 text-[12px] text-ink-400 hover:text-ink-900 mb-8 transition-colors"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Back to show
    </Link>
  );
}

type Stage = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  timestamp?: Date | null;
};

function LifecycleBar({
  settlement,
  disputedRecoups,
}: {
  settlement: Settlement;
  disputedRecoups: number;
}) {
  if (settlement.status === "voided") {
    return (
      <div className="rounded-lg border border-ink-200/80 bg-white px-5 py-4 flex items-center gap-3">
        <XCircle className="h-4 w-4 text-ink-400" />
        <div>
          <div className="text-[13px] font-medium text-ink-900">
            Settlement voided
          </div>
          <div className="text-[11.5px] text-ink-400 mt-0.5">
            The show was cancelled or the settlement was scrapped.
          </div>
        </div>
      </div>
    );
  }

  const stages: Stage[] = [
    {
      key: "draft",
      label: "Drafted",
      icon: Pencil,
      timestamp: settlement.draftedAt,
    },
    {
      key: "submitted",
      label: "Submitted",
      icon: Mail,
      timestamp: settlement.submittedAt,
    },
    {
      key: "review",
      label: "Reviewed",
      icon: TrendingUp,
      timestamp: settlement.reviewStartedAt,
    },
    {
      key: "signed",
      label: settlement.disputedAt ? "Finalized" : "Signed",
      icon: Check,
      timestamp: settlement.finalizedAt ?? settlement.signedAt,
    },
    {
      key: "paid",
      label: "Paid",
      icon: Wallet,
      timestamp: settlement.paidAt,
    },
  ];

  const currentIndex = (() => {
    switch (settlement.status) {
      case "draft":
        return 0;
      case "submitted":
        return 1;
      case "in_review":
        return 2;
      case "disputed":
      case "signed":
      case "revised":
      case "finalized":
        return 3;
      case "paid":
        return 4;
      default:
        return 0;
    }
  })();

  const isDisputed =
    settlement.status === "disputed" ||
    settlement.status === "revised" ||
    !!settlement.disputedAt;

  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="eyebrow text-[10px] text-ink-400">
            Settlement lifecycle
          </div>
          {isDisputed && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-700">
              <AlertTriangle className="h-3 w-3" />
              {settlement.status === "disputed"
                ? "In dispute"
                : settlement.status === "revised"
                  ? "Revision sent"
                  : "Resolved after dispute"}
              {disputedRecoups > 0 && (
                <span className="text-rose-600">
                  · {disputedRecoups} disputed recoup
                  {disputedRecoups === 1 ? "" : "s"}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1 relative">
          {/* Background track */}
          <div className="absolute top-3.5 left-[10%] right-[10%] h-px bg-ink-200/60" />
          {/* Progress fill */}
          {currentIndex > 0 && (
            <div
              className={`absolute top-[13px] left-[10%] h-0.5 rounded-full transition-all duration-700 ${
                isDisputed
                  ? "bg-gradient-to-r from-rose-400 to-rose-600"
                  : "bg-gradient-to-r from-brand-500 to-brand-700"
              }`}
              style={{ width: `${(currentIndex / (stages.length - 1)) * 80}%` }}
            />
          )}

          {stages.map((stage, i) => {
            const isComplete = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isFuture = i > currentIndex;
            const Icon = stage.icon;

            const stageDot = (() => {
              if (isComplete) {
                return "bg-brand-700 ring-brand-700 text-white";
              }
              if (isCurrent) {
                return isDisputed
                  ? "bg-rose-50 ring-rose-500 text-rose-700"
                  : "bg-brand-50 ring-brand-700 text-brand-700";
              }
              return "bg-white ring-ink-200/80 text-ink-300";
            })();

            return (
              <div
                key={stage.key}
                className="flex flex-col items-center text-center"
              >
                <div className="relative z-10">
                  {isCurrent && (
                    <span
                      className={`absolute inset-0 rounded-full animate-ping opacity-40 ${
                        isDisputed ? "bg-rose-400" : "bg-brand-400"
                      }`}
                    />
                  )}
                  <div
                    className={`relative w-7 h-7 rounded-full ring-2 flex items-center justify-center ${stageDot}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div
                  className={`mt-2.5 text-[11px] font-medium leading-tight ${
                    isFuture ? "text-ink-300" : "text-ink-900"
                  }`}
                >
                  {stage.label}
                </div>
                <div className="text-[10px] text-ink-400 mt-0.5 font-mono tabular leading-tight min-h-[12px]">
                  {stage.timestamp
                    ? new Date(stage.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function UnsupportedDeal({
  dealType,
  dealRead,
  deal,
  existingSettlement,
  grossSoFar,
  totalFees,
  totalExpenses,
  ticketCount,
  expenseRowCount,
}: {
  dealType: string;
  dealRead?: DealRead;
  deal: NonNullable<Awaited<ReturnType<typeof getShowById>>>["deal"];
  existingSettlement: NonNullable<
    Awaited<ReturnType<typeof getShowById>>
  >["settlement"];
  grossSoFar: number;
  totalFees: number;
  totalExpenses: number;
  ticketCount: number;
  expenseRowCount: number;
}) {
  const friendly: Record<string, string> = {
    flat: "flat guarantee",
    percentage_of_gross: "percentage of gross",
    percentage_of_net: "percentage of net",
    vs: "vs deal",
    door: "door deal",
  };

  return (
    <>
      {dealRead && <DealReadPanel dealRead={dealRead} />}

      <Card accent="amber">
        <CardContent className="py-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200/80 mb-5">
            <FileWarning className="h-5 w-5 text-amber-700" />
          </div>
          <h2 className="font-display text-[22px] font-medium text-ink-900 mb-2" style={{ letterSpacing: "-0.02em" }}>
            The in-app tool can&apos;t settle a {friendly[dealType] ?? dealType} yet.
          </h2>
          <p className="text-[13px] text-ink-500 max-w-md mx-auto leading-relaxed">
            Mariana would do this on a Google Sheet at 2am tonight. The inputs
            are below — but the math doesn&apos;t happen here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>What the system has</CardTitle>
            <CardDescription>
              The inputs Mariana would pull together to settle this show.
              They&apos;re here — but disconnected from the deal terms.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field
              label="Gross box office"
              mono
              value={formatMoney(grossSoFar)}
            />
            <Field label="Fees" mono value={formatMoney(totalFees)} />
            <Field
              label="Net box office"
              mono
              value={formatMoney(grossSoFar - totalFees)}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="Tickets sold" mono value={String(ticketCount)} />
            <Field
              label="Expenses (line items)"
              mono
              value={String(expenseRowCount)}
            />
            <Field
              label="Expenses (passed through)"
              mono
              value={formatMoney(totalExpenses)}
            />
          </div>

          {deal?.dealNotesFreetext && (
            <div className="mt-6">
              <div className="eyebrow text-[10px] text-ink-500 mb-2">
                Deal notes (free text — what Mariana actually trusts)
              </div>
              <div className="text-[12.5px] text-ink-800 bg-canvas-soft rounded-lg p-4 ring-1 ring-ink-200/60 leading-relaxed">
                {deal.dealNotesFreetext}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {existingSettlement?.totalToArtist != null && (
        <Card
          accent={existingSettlement.status === "disputed" ? "rose" : "brand"}
        >
          <CardHeader>
            <div>
              <CardTitle>Actually settled (off-platform)</CardTitle>
              <CardDescription>
                Mariana ran this in a spreadsheet. Here&apos;s the result that
                was logged back into Greenroom afterward.
              </CardDescription>
            </div>
            {existingSettlement.status === "disputed" ? (
              <PlainBadge variant="rose">Disputed</PlainBadge>
            ) : (
              <PlainBadge variant="brand">Signed</PlainBadge>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between py-2">
              <span className="text-[13px] text-ink-600">Total to artist</span>
              <span className="text-[32px] font-mono tabular font-semibold text-ink-900" style={{ letterSpacing: "-0.02em" }}>
                {formatMoney(existingSettlement.totalToArtist)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function SupportedSettlement({
  calc,
  existingSettlement,
  submitAction,
}: {
  calc: Extract<
    ReturnType<typeof calculateSettlement>,
    { supported: true }
  >;
  existingSettlement: NonNullable<
    Awaited<ReturnType<typeof getShowById>>
  >["settlement"];
  submitAction: () => Promise<void>;
}) {
  return (
    <>
      {calc.dealRead && (
        <DealReadPanel
          dealRead={calc.dealRead}
          showConfirmButton={
            calc.dealRead.confidence === "ready" &&
            (!existingSettlement || existingSettlement.status === "draft")
          }
          submitAction={submitAction}
        />
      )}

      {/* Hero number */}
      <div className="text-center py-12 mb-2 animate-fade-up">
        <div className="eyebrow text-[10px] text-ink-400 mb-4">Total to artist</div>
        <div
          className="text-[72px] font-mono tabular font-bold text-ink-900 leading-none"
          style={{ letterSpacing: "-0.03em" }}
        >
          {formatMoney(calc.totalToArtist)}
        </div>
        {existingSettlement && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {existingSettlement.status === "paid" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 ring-1 ring-brand-200/80 text-brand-700 text-[12px] font-semibold">
                <Check className="h-3.5 w-3.5" />
                Paid & settled
              </span>
            ) : existingSettlement.status === "signed" ||
              existingSettlement.status === "finalized" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 ring-1 ring-brand-200/80 text-brand-700 text-[12px] font-semibold">
                <Check className="h-3.5 w-3.5" />
                Signed
              </span>
            ) : existingSettlement.status === "disputed" ? (
              <PlainBadge variant="rose">Disputed</PlainBadge>
            ) : null}
          </div>
        )}
        {existingSettlement?.totalToArtist != null &&
          existingSettlement.totalToArtist !== calc.totalToArtist && (
          <div className="text-[12px] text-ink-400 mt-2">
            Originally settled at{" "}
            <span className="font-mono tabular text-ink-600">
              {formatMoney(existingSettlement.totalToArtist)}
            </span>
          </div>
        )}
      </div>

      {calc.calculationKind === "vs" && calc.vsDetails && (
        <VsTrustSummary details={calc.vsDetails} />
      )}

      {/* Worksheet breakdown */}
      <Card accent="brand">
        <CardHeader>
          <div>
            <CardTitle>Settlement worksheet</CardTitle>
            <CardDescription className="font-mono">
              {calc.finalFormula}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-ink-100/80">
          {calc.auditRows ? (
            <AuditRows rows={calc.auditRows} />
          ) : (
            <>
              <Row
                label="Gross box office"
                value={formatMoney(calc.grossBoxOffice)}
              />
              <Row label="Net box office" value={formatMoney(calc.netBoxOffice)} />
              <Row
                label="Total expenses (passed through)"
                value={formatMoney(calc.totalExpenses)}
              />
              <div className="pt-3" />
              {calc.steps.map((step, i) => (
                <Row
                  key={i}
                  label={step.label}
                  value={formatMoney(step.value)}
                  note={step.note}
                />
              ))}
              <div className="pt-3" />
            </>
          )}
          <div className="flex items-baseline justify-between py-3 font-semibold">
            <span className="text-[13px] text-ink-900">Total to artist</span>
            <span className="text-[18px] font-mono tabular text-ink-900">
              {formatMoney(calc.totalToArtist)}
            </span>
          </div>
        </CardContent>
      </Card>

      {calc.bonusesNotTriggered.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bonuses not triggered</CardTitle>
            <CardDescription>
              Structured bonuses on this deal that didn&apos;t hit. Shown for
              transparency — useful when the agent asks &quot;what about that
              gross threshold bonus?&quot;
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-ink-100/80">
            {calc.bonusesNotTriggered.map((b, i) => (
              <div
                key={i}
                className="py-3 flex items-baseline justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-[13px] text-ink-600">{b.label}</div>
                  <div className="text-[11.5px] text-ink-400 mt-0.5">
                    {b.reason}
                  </div>
                </div>
                <div className="text-[12.5px] text-ink-300 font-mono tabular line-through">
                  {formatMoney(b.amount)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}

function DealReadPanel({
  dealRead,
  showConfirmButton = false,
  submitAction,
}: {
  dealRead: DealRead;
  showConfirmButton?: boolean;
  submitAction?: () => Promise<void>;
}) {
  const confidence = {
    ready: {
      label: "Ready to settle",
      badge: "brand" as const,
      accent: "brand" as const,
      copy: "Base terms are readable enough to run and explain the math.",
    },
    review: {
      label: "Needs review",
      badge: "amber" as const,
      accent: "amber" as const,
      copy: "The math can run, but the settlement should call out the risky read.",
    },
    blocked: {
      label: "Manual model",
      badge: "rose" as const,
      accent: "rose" as const,
      copy: "The base terms are visible, but this variant should stay out of the calculator until modeled.",
    },
  }[dealRead.confidence];

  return (
    <Card accent={confidence.accent}>
      <CardHeader>
        <div>
          <CardTitle>Deal read</CardTitle>
          <CardDescription>
            Greenroom reads the free-text deal note first, then checks it
            against the structured fields.
          </CardDescription>
        </div>
        <PlainBadge variant={confidence.badge}>{confidence.label}</PlainBadge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
          <div>
            <div className="text-[14px] font-medium text-ink-900">
              {dealRead.summary}
            </div>
            <div className="text-[12.5px] text-ink-500 mt-1.5 leading-relaxed">
              {confidence.copy}
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {dealRead.terms.map((term) => (
                <div
                  key={term.label}
                  className="rounded-md border border-ink-200/70 bg-canvas-soft px-3 py-2.5"
                >
                  <div className="eyebrow text-[9px] text-ink-400 mb-1">
                    {term.label}
                  </div>
                  <div className="text-[13px] font-mono tabular text-ink-900">
                    {term.value}
                  </div>
                  <div className="text-[10.5px] text-ink-400 mt-1">
                    {term.source}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {dealRead.flags.length > 0 ? (
              dealRead.flags.map((flag) => (
                <div
                  key={`${flag.label}-${flag.detail}`}
                  className={`rounded-md px-3 py-2.5 ring-1 ${
                    flag.severity === "risk"
                      ? "bg-rose-50/70 text-rose-800 ring-rose-200/80"
                      : "bg-amber-50/70 text-amber-800 ring-amber-200/80"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[12px] font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {flag.label}
                  </div>
                  <div className="text-[11.5px] mt-1 leading-relaxed">
                    {flag.detail}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-md px-3 py-2.5 ring-1 bg-brand-50/70 text-brand-800 ring-brand-200/80">
                <div className="flex items-center gap-2 text-[12px] font-semibold">
                  <Check className="h-3.5 w-3.5" />
                  No deal-read conflicts found
                </div>
                <div className="text-[11.5px] mt-1 leading-relaxed">
                  The trusted notes and structured fields agree on the core
                  settlement terms.
                </div>
              </div>
            )}

            {dealRead.assumptions.length > 0 && (
              <div className="rounded-md border border-ink-200/70 bg-white px-3 py-2.5">
                <div className="eyebrow text-[9px] text-ink-400 mb-2">
                  Assumptions to show
                </div>
                <div className="space-y-1.5">
                  {dealRead.assumptions.map((assumption) => (
                    <div
                      key={assumption}
                      className="text-[11.5px] leading-relaxed text-ink-600"
                    >
                      {assumption}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {showConfirmButton && submitAction && (
          <div className="mt-6 pt-5 border-t border-ink-100/80 flex items-center justify-between gap-4">
            <p className="text-[12px] text-ink-500 leading-relaxed">
              Deal read is clean. Submitting sends this settlement to the artist team for sign-off.
            </p>
            <form action={submitAction}>
              <button
                type="submit"
                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shadow-sm shadow-brand-700/20"
              >
                <Check className="h-3.5 w-3.5" />
                Submit to artist team
              </button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function VsTrustSummary({ details }: { details: VsDetails }) {
  const winnerLabel =
    details.winner === "percentage" ? "Percentage beats guarantee" : "Guarantee wins";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card accent="brand">
        <CardContent>
          <div className="eyebrow text-[10px] text-ink-500 mb-1">
            Deal outcome
          </div>
          <div className="text-[14px] font-semibold text-ink-900">
            {winnerLabel}
          </div>
          <div className="text-[12px] text-ink-500 mt-1 leading-relaxed">
            {formatMoney(details.percentageTake)} percentage take vs{" "}
            {formatMoney(details.guarantee)} floor.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="eyebrow text-[10px] text-ink-500 mb-1">
            Expense treatment
          </div>
          <div className="text-[14px] font-semibold text-ink-900">
            {details.basis === "gross"
              ? "No expense deduction"
              : `${formatMoney(details.appliedExpenses)} counted`}
          </div>
          <div className="text-[12px] text-ink-500 mt-1 leading-relaxed">
            {details.basis === "gross"
              ? "Vs-gross deal read from the notes."
              : details.absorbedOrCappedExpenses > 0
                ? `${formatMoney(details.absorbedOrCappedExpenses)} absorbed or capped out.`
                : "All passed-through expenses count under the cap."}
          </div>
        </CardContent>
      </Card>

      <Card accent={details.disputedRecoups > 0 ? "rose" : undefined}>
        <CardContent>
          <div className="eyebrow text-[10px] text-ink-500 mb-1">
            Recoup posture
          </div>
          <div className="text-[14px] font-semibold text-ink-900">
            {details.recoupsApplied > 0
              ? `${formatMoney(details.recoupsApplied)} applied`
              : "No active recoups"}
          </div>
          <div className="text-[12px] text-ink-500 mt-1 leading-relaxed">
            {details.disputedRecoups > 0
              ? `${formatMoney(details.disputedRecoups)} is disputed and should be explicitly resolved.`
              : details.recoupTreatment === "against_gross"
                ? "Deducted before the split per deal notes."
                : "Nothing extra deducted from gross."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AuditRows({ rows }: { rows: AuditRow[] }) {
  return (
    <>
      {rows.map((row) => {
        const valueClass =
          row.tone === "positive"
            ? "text-brand-800"
            : row.tone === "warning"
              ? "text-amber-800"
              : row.tone === "negative"
                ? "text-ink-600"
                : "text-ink-900";

        return (
          <div
            key={`${row.label}-${row.source}`}
            className="py-3 grid grid-cols-[1fr_auto] gap-4 items-start"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-[13px] text-ink-700">{row.label}</div>
                <span className="rounded bg-ink-50 px-1.5 py-0.5 text-[10px] text-ink-400 ring-1 ring-ink-200/70">
                  {row.source}
                </span>
              </div>
              {row.note && (
                <div className="text-[11.5px] text-ink-400 mt-1 max-w-xl leading-snug">
                  {row.note}
                </div>
              )}
            </div>
            <div
              className={`text-[13.5px] font-mono tabular text-right ${valueClass}`}
            >
              {formatMoney(row.value)}
            </div>
          </div>
        );
      })}
      <div className="pt-3" />
    </>
  );
}

function RecoupsSection({ recoups }: { recoups: Recoup[] }) {
  const total = recoups.reduce((s, r) => s + r.amount, 0);
  const disputedTotal = recoups
    .filter((r) => r.status === "disputed")
    .reduce((s, r) => s + r.amount, 0);
  const hasDisputed = disputedTotal > 0;

  return (
    <Card accent={hasDisputed ? "rose" : undefined}>
      <CardHeader>
        <div>
          <CardTitle>Recoups</CardTitle>
          <CardDescription>
            Venue costs taken off the top before artist payment. Often the
            disputed line items in a settlement.
          </CardDescription>
        </div>
        <PlainBadge variant={hasDisputed ? "rose" : "default"}>
          {formatMoney(total)} total
        </PlainBadge>
      </CardHeader>
      <CardContent className="divide-y divide-ink-100/80">
        {recoups.map((r) => (
          <div
            key={r.id}
            className="py-3.5 grid grid-cols-[1fr_auto_auto] items-center gap-3"
          >
            <div className="min-w-0">
              <div className="text-[13px] text-ink-900 leading-tight">
                {r.label}
              </div>
              <div className="text-[11.5px] text-ink-400 mt-0.5">
                {RECOUP_LABELS[r.category]}
              </div>
            </div>
            <div>
              {r.status === "disputed" ? (
                <PlainBadge variant="rose">Disputed</PlainBadge>
              ) : r.status === "withdrawn" ? (
                <PlainBadge variant="default">Withdrawn</PlainBadge>
              ) : (
                <PlainBadge variant="brand">Agreed</PlainBadge>
              )}
            </div>
            <div className="text-[13.5px] font-mono tabular text-ink-900 text-right min-w-[80px]">
              {formatMoney(r.amount)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SignoffSection({
  settlement,
  isDisputed,
}: {
  settlement: Settlement;
  isDisputed: boolean;
}) {
  const hasSignoffConflict = isDisputed && !!settlement.signoffText;

  return (
    <div className="space-y-4">
      {hasSignoffConflict && (
        <div className="rounded-xl border-2 border-amber-300/70 bg-gradient-to-r from-amber-50/80 to-canvas p-5 flex gap-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 ring-2 ring-amber-300/80 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <div className="text-[13.5px] font-bold text-amber-900 mb-1.5">
              Status/sign-off conflict
            </div>
            <p className="text-[12.5px] text-amber-800 leading-relaxed">
              This settlement is marked <strong className="font-semibold">Disputed</strong>{" "}
              in the system, but the artist team&apos;s sign-off message reads as approval.
              This mismatch should be reconciled before closing — the system status doesn&apos;t
              reflect what the artist team actually communicated.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sign-off & notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {settlement.signoffText && (
            <div>
              <div className="eyebrow text-[10px] text-ink-500 mb-2">
                From the artist team
              </div>
              <div className="text-[13px] text-ink-800 bg-canvas-soft rounded-lg p-4 ring-1 ring-ink-200/60 leading-relaxed">
                &ldquo;{settlement.signoffText}&rdquo;
              </div>
            </div>
          )}
          {settlement.notes && (
            <div>
              <div className="eyebrow text-[10px] text-ink-500 mb-2">
                Mariana&apos;s settlement notes
              </div>
              <div className="text-[12.5px] text-ink-800 bg-canvas-soft rounded-lg p-4 ring-1 ring-ink-200/60 leading-relaxed">
                {settlement.notes}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-baseline justify-between py-2.5">
      <div>
        <div className="text-[13px] text-ink-600">{label}</div>
        {note && (
          <div className="text-[11.5px] text-ink-400 mt-0.5 max-w-md leading-snug">
            {note}
          </div>
        )}
      </div>
      <div className="text-[13.5px] text-ink-900 font-mono tabular">
        {value}
      </div>
    </div>
  );
}
