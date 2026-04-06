"use client";

import { FormEvent, useEffect, useState } from "react";
import Spinner from "@/components/Spinner";

type PromoRow = {
  id: number;
  code: string;
  label: string | null;
  discountType: string;
  percentOff: number | null;
  amountOffCents: number | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
};

export default function AdminPromoCodesPage() {
  const [rows, setRows] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "amount">(
    "percent"
  );
  const [percentOff, setPercentOff] = useState(10);
  const [amountOffDollars, setAmountOffDollars] = useState("25");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promo-codes");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setRows(data);
      setListError(null);
    } catch {
      setListError("Could not load promo codes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createPromo = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const amountOffCents = Math.round(parseFloat(amountOffDollars || "0") * 100);
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          label: label.trim() || undefined,
          discountType,
          percentOff: discountType === "percent" ? percentOff : undefined,
          amountOffCents:
            discountType === "amount" ? amountOffCents : undefined,
          maxRedemptions: maxRedemptions.trim()
            ? Number(maxRedemptions)
            : undefined,
          expiresAt: expiresAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Create failed");
      setCode("");
      setLabel("");
      setMaxRedemptions("");
      setExpiresAt("");
      await load();
    } catch (err: unknown) {
      setFormError((err as Error).message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: number, active: boolean) => {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (!res.ok) throw new Error("Update failed");
      await load();
    } catch {
      setListError("Could not update promo code.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-gray-700 py-12">
        <Spinner />
        Loading promo codes…
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Promo codes</h1>
      <p className="text-gray-600 mb-8">
        Codes are created in Stripe and can be entered at checkout on the
        customer&apos;s account (pricing → checkout). Use letters, numbers,
        underscores, or hyphens only.
      </p>
      {listError && (
        <div className="mb-4 text-red-600 text-sm">{listError}</div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-10 max-w-xl">
        <h2 className="text-xl font-bold mb-4">Create promo code</h2>
        <form onSubmit={createPromo} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Code
            </label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="LAUNCH25"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Label (optional)
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Spring campaign"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Discount type
            </label>
            <select
              value={discountType}
              onChange={(e) =>
                setDiscountType(e.target.value as "percent" | "amount")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="percent">Percent off</option>
              <option value="amount">Fixed amount off (USD)</option>
            </select>
          </div>
          {discountType === "percent" ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Percent off (1–100)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={percentOff}
                onChange={(e) => setPercentOff(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Amount off (USD)
              </label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={amountOffDollars}
                onChange={(e) => setAmountOffDollars(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Max redemptions (optional)
            </label>
            <input
              type="number"
              min={1}
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Unlimited"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Expires (optional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          {formError && (
            <div className="text-red-600 text-sm">{formError}</div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create in Stripe"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Active codes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Code</th>
                <th className="px-4 py-3 text-left font-semibold">Discount</th>
                <th className="px-4 py-3 text-left font-semibold">Uses</th>
                <th className="px-4 py-3 text-left font-semibold">Expires</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No promo codes yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold">{r.code}</td>
                    <td className="px-4 py-3">
                      {r.discountType === "percent"
                        ? `${r.percentOff}%`
                        : `$${((r.amountOffCents || 0) / 100).toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3">
                      {r.timesRedeemed}
                      {r.maxRedemptions != null
                        ? ` / ${r.maxRedemptions}`
                        : ""}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.expiresAt
                        ? new Date(r.expiresAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          r.active
                            ? "text-green-700 font-medium"
                            : "text-gray-500"
                        }
                      >
                        {r.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(r.id, r.active)}
                        className="text-blue-600 hover:underline"
                      >
                        {r.active ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
