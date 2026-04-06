"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  formatPlanLabel,
  formatCatalogPricing,
  formatMonthlyFromCents,
  getActiveMonthlyCents,
  getBuildWindowDaysRemaining,
} from "@/lib/plan-display";

interface Client {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  siteUrl?: string;
  pricingTier: string;
  numSites: number;
  subscriptions?: Array<{
    id: number;
    status: string;
    amountMonthly: number;
    nextBillingDate: string | null;
  }>;
  payments?: Array<{
    status: string;
    paidAt: string | null;
    createdAt: string;
  }>;
}

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/admin/clients/${clientId}`);
        if (response.ok) {
          const data = await response.json();
          setClient(data);
        } else {
          setError("Client not found");
        }
      } catch (err) {
        setError("Failed to load client");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!client) return;
    const { name, value } = e.target;
    setClient({ ...client, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(client),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/clients");
        }, 1500);
      } else {
        setError("Failed to save client");
      }
    } catch (err) {
      setError("Error saving client");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const planSummary = useMemo(() => {
    if (!client) return null;
    const monthly = formatMonthlyFromCents(getActiveMonthlyCents(client.subscriptions));
    const catalog = formatCatalogPricing(client.pricingTier, client.numSites);
    return { label: formatPlanLabel(client.pricingTier), catalog, monthly };
  }, [client]);

  const buildDaysLeft = useMemo(() => {
    if (!client?.payments?.length) return null;
    return getBuildWindowDaysRemaining(client.payments);
  }, [client]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error || "Client not found"}</p>
        <button
          onClick={() => router.push("/admin/clients")}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          ← Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => router.push("/admin/clients")}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Back to Clients
        </button>
        <h1 className="text-4xl font-bold">Edit Client</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={client.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={client.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={client.company || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={client.phone || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              name="siteUrl"
              value={client.siteUrl || ""}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
            />
            <p className="text-sm text-gray-600 mt-1">
              This is the URL of the website you&apos;re building for this client
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pricing Plan
            </label>
            <input
              type="text"
              value={client.pricingTier}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
            {planSummary && (
              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 space-y-1">
                <div>
                  <span className="font-semibold">{planSummary.label}</span>
                  <span className="text-gray-600"> — {planSummary.catalog}</span>
                </div>
                {planSummary.monthly ? (
                  <div>
                    Active subscription:{" "}
                    <span className="font-medium">{planSummary.monthly}</span>
                  </div>
                ) : (
                  <div className="text-gray-600">
                    No active monthly charge on file (one-time only or pending).
                  </div>
                )}
                {(() => {
                  const sub = client.subscriptions?.find(
                    (s) => s.status === "active" && s.nextBillingDate
                  );
                  if (!sub?.nextBillingDate) return null;
                  return (
                    <div>
                      Next renewal:{" "}
                      {new Date(sub.nextBillingDate).toLocaleDateString()}
                    </div>
                  );
                })()}
                {buildDaysLeft !== null && (
                  <div className="pt-1 border-t border-gray-200 mt-2">
                    30-day build window:{" "}
                    {buildDaysLeft < 0 ? (
                      <span className="text-gray-700">ended</span>
                    ) : buildDaysLeft === 0 ? (
                      <span className="font-medium text-amber-800">last day</span>
                    ) : (
                      <span className="font-medium">{buildDaysLeft} days left</span>
                    )}{" "}
                    (from first successful payment)
                  </div>
                )}
              </div>
            )}
            <p className="text-sm text-gray-600 mt-2">
              Plan type cannot be changed here
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              ✓ Client saved successfully! Redirecting...
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/clients")}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
