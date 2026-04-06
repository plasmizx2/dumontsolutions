"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [numSites, setNumSites] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");

  const showNumSites = plan?.id === "multi_site";

  const title = useMemo(() => {
    if (!plan) return "Checkout";
    return `Checkout — ${plan.name}`;
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

  useEffect(() => {
    if (!open || !plan || status !== "authenticated") return;
    const role = (session?.user as { role?: string })?.role;
    if (role !== "client") return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/client/me");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
        if (typeof data.numSites === "number" && data.numSites >= 1) {
          setNumSites(data.numSites);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, plan, session, status]);

  if (!open || !plan) return null;

  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-950/40 backdrop-blur-sm">
        <div className="card p-10 flex items-center gap-3">
          <Spinner />
          <span className="text-slate-700">Loading...</span>
        </div>
      </div>
    );
  }

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan.id,
          numSites: showNumSites ? numSites : 1,
          promoCode: promoCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        throw new Error(
          data?.error ||
            "Sign up and sign in before checkout. Use Sign up in the menu."
        );
      }
      if (!res.ok) {
        throw new Error(data?.error || "Failed to start checkout");
      }
      if (!data?.url) {
        throw new Error("Missing checkout URL");
      }
      window.location.href = data.url;
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-10"
      role="dialog"
      aria-modal="true"
      aria-label="Checkout"
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
              You&apos;re signed in. Continue to secure Stripe checkout. You can
              close this anytime.
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
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Promo code{" "}
              <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent font-mono"
              placeholder="e.g. LAUNCH25"
              autoComplete="off"
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
                onChange={(e) =>
                  setNumSites(Math.max(1, Number(e.target.value || 1)))
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-slate-500">
                You&apos;ll be charged $175 per site.
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
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <>
                  <Spinner />
                  Redirecting to Stripe...
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
