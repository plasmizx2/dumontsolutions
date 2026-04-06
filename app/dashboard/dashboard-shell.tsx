"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

type Props = {
  checkoutSuccess: boolean;
  initialCompany: string | null;
  initialPhone: string | null;
  initialSiteUrl: string | null;
};

export default function DashboardShell({
  checkoutSuccess,
  initialCompany,
  initialPhone,
  initialSiteUrl,
}: Props) {
  const router = useRouter();
  const [showThanks, setShowThanks] = useState(checkoutSuccess);
  const [company, setCompany] = useState(initialCompany ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [siteUrl, setSiteUrl] = useState(initialSiteUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShowThanks(checkoutSuccess);
  }, [checkoutSuccess]);

  const incomplete =
    !initialCompany?.trim() ||
    !initialPhone?.trim() ||
    !initialSiteUrl?.trim();

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    try {
      const res = await fetch("/api/client/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim() || null,
          phone: phone.trim() || null,
          siteUrl: siteUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Could not save");
      }
      setSavedMsg("Saved.");
      router.refresh();
    } catch (e: unknown) {
      setError((e as Error).message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {showThanks && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="thanks-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setShowThanks(false)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-md card p-8 sm:p-10 text-center">
            <div className="text-4xl mb-3" aria-hidden>
              ✓
            </div>
            <h2
              id="thanks-title"
              className="text-2xl font-black tracking-tight text-slate-900"
            >
              Payment received
            </h2>
            <p className="mt-3 text-slate-600">
              Stripe will email a receipt to your address. You can also
              download receipts from your dashboard payment history.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Turn on receipt emails in Stripe Dashboard → Settings → Customer
              emails if you don&apos;t see them.
            </p>
            <button
              type="button"
              onClick={() => setShowThanks(false)}
              className="btn-primary w-full mt-6"
            >
              Continue to dashboard
            </button>
          </div>
        </div>
      )}

      {incomplete && (
        <div className="card p-8 mb-10 border border-primary-200/60 bg-primary-50/30">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Complete your project details
          </h2>
          <p className="text-slate-600 mb-6">
            Add your company, phone, and live site URL (or placeholder) so we
            can reach you and link your project.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Company
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Site URL
              </label>
              <input
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="https://yoursite.com"
              />
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm">
              {error}
            </div>
          )}
          {savedMsg && (
            <p className="mt-4 text-sm text-emerald-700 font-medium">{savedMsg}</p>
          )}
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="btn-primary mt-6 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Spinner />
                Saving…
              </>
            ) : (
              "Save details"
            )}
          </button>
        </div>
      )}
    </>
  );
}
