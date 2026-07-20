"use client";

import { useState } from "react";
import { DelegateLinkButton } from "@/components/governance/DelegateLinkButton";
import type { Validator } from "@/lib/types";

/** Campaign hub — public profile editor + pinned announcement. */
export function CampaignHubSection({ validator }: { validator: Validator }) {
  const [description, setDescription] = useState(validator.description ?? "");
  const [website, setWebsite] = useState(validator.website ?? "");
  const [notice, setNotice] = useState(validator.pinnedNotice ?? "");
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-body">
          Public Profile
        </h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="campaign-website"
              className="text-[11px] font-bold uppercase tracking-wider text-body"
            >
              Website
            </label>
            <input
              id="campaign-website"
              type="url"
              value={website}
              onChange={(e) => {
                setWebsite(e.target.value);
                setSaved(false);
              }}
              placeholder="https://yournode.io"
              className="w-full rounded-lg border border-border-strong bg-card px-3 py-2 text-sm text-ink transition-colors focus:border-brand focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="campaign-description"
              className="text-[11px] font-bold uppercase tracking-wider text-body"
            >
              Node Description
            </label>
            <textarea
              id="campaign-description"
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSaved(false);
              }}
              placeholder="Tell voters who you are and how you run your infrastructure."
              className="w-full rounded-lg border border-border-strong bg-card px-3 py-2 text-sm text-ink transition-colors focus:border-brand focus:outline-none"
            />
          </div>

          <p className="text-[11px] text-muted">
            Logo and hero graphic upload need a file store — see
            docs/integration.md. Filenames currently resolve from
            <code className="mx-1 font-mono">public/assets</code>.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-body">
          Pinned Announcement
        </h2>
        <p className="mb-3 text-[11px] text-muted">
          Appears at the top of your public miner profile. Use it for AMAs, X
          Spaces, or community events.
        </p>
        <textarea
          rows={2}
          value={notice}
          onChange={(e) => {
            setNotice(e.target.value);
            setSaved(false);
          }}
          placeholder="e.g. Join our X Space on Thursday at 18:00 UTC."
          className="w-full rounded-lg border border-border-strong bg-card px-3 py-2 text-sm text-ink transition-colors focus:border-brand focus:outline-none"
        />

        {notice.trim() && (
          <div className="mt-3">
            <span className="mb-1 block text-[10px] uppercase tracking-wide text-muted">
              Preview
            </span>
            <p className="rounded-lg border border-brand/20 bg-brand-tint px-4 py-3 text-xs font-medium text-brand">
              📌 {notice}
            </p>
          </div>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-body">
            One-Click Delegate Link
          </h2>
          <p className="mt-1 text-[11px] text-muted">
            Share this to send voters straight to your delegation step.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DelegateLinkButton validatorId={validator.id} />
          <button
            type="button"
            onClick={() => setSaved(true)}
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
          >
            {saved ? "Saved" : "Save Profile"}
          </button>
        </div>
      </section>

      {saved && (
        <p className="rounded-lg border border-warning/30 bg-warning-tint px-3 py-2 text-[11px] font-medium text-warning">
          Saved locally only. Persisting profile edits needs the off-chain profile
          store described in docs/integration.md — nothing has been written.
        </p>
      )}
    </div>
  );
}
