"use client";

import { useEffect, useMemo, useState } from "react";
import Spinner from "@/components/Spinner";

type PlanId = "basic_site" | "site_maintenance" | "multi_site";

export default function SignupModal({
  open,
  onClose,
  plan,
}: {
  open: boolean;
  onClose: () => void;
  plan: { id: PlanId; name: string } | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [numSites, setNumSites] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showNumSites = plan?.id === "multi_site";

  const title = useMemo(() => {
    if (!plan) return "Get started";
    return `Get started — ${plan.name}`;
  }, [plan]);

  useEffect(() => {
    if (!open) return;
    setError(null);
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !plan) return null;

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan.id,
          clientName: name,
          clientEmail: email,
          numSites: showNumSites ? numSites : 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to start checkout");
      }
      if (!data?.url) {
        throw new Error("Missing checkout URL");
      }
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-10"
      role="dialog"
      aria-modal="true"
      aria-label="Sign up"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative w-full max-w-lg card p-8 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-slate-600">
              Enter your info to start. You can close this anytime.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 hover:bg-slate-900/5 transition text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="you@company.com"
            />
          </div>

          {showNumSites && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Number of sites
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={numSites}
                onChange={(e) => setNumSites(Math.max(1, Number(e.target.value || 1)))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-slate-500">
                You’ll be charged ${plan.id === "multi_site" ? "175" : "225"} per site.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full"
              disabled={loading}
            >
              Exit
            </button>
            <button
              type="button"
              onClick={submit}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !name.trim() || !email.trim()}
            >
              {loading ? (
                <>
                  <Spinner />
                  Starting...
                </>
              ) : (
                "Continue to checkout"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

