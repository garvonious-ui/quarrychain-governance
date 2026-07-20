import { Card, CardHeader } from "@/components/ui/Card";

/**
 * Module B — Interactive Voting, Staking & Yield Portal.
 * Built in Phase 2: Freeze → Select → Cast → Manage, plus the live earnings
 * odometer and auto-compounding toggle.
 */

const STEPS = ["Freeze Asset", "Select Miner", "Cast Vote", "Manage Pool"];

export default function VotingPage() {
  return (
    <Card>
      <CardHeader
        title="Quarry DPoS Stake & Voting Engine"
        subtitle="Lock utility assets to generate execution energy, assign block weight, and earn network yield."
      />
      <div className="px-6 py-10">
        <div className="relative mx-auto flex max-w-2xl items-center justify-between">
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-border" />
          {STEPS.map((label, i) => (
            <div key={label} className="relative flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-border text-xs font-bold text-muted">
                {i + 1}
              </div>
              <span className="mt-2 text-[11px] font-semibold text-muted">
                {label}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted">
          The delegation wizard, live earnings odometer, and auto-compounding
          controls ship in Phase 2.
        </p>
      </div>
    </Card>
  );
}
