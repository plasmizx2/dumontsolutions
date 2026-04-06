"use client";

import { useEffect, useState } from "react";
import {
  formatPlanLabel,
  formatCatalogPricing,
  formatMonthlyFromCents,
  getActiveMonthlyCents,
} from "@/lib/plan-display";

interface Client {
  id: number;
  name: string;
  email: string;
  company?: string;
  siteUrl?: string;
  pricingTier: string;
  numSites: number;
  createdAt: string;
  subscriptions?: Array<{ status: string; amountMonthly: number }>;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Delete this client and all related subscriptions and payments? This cannot be undone."
      )
    ) {
      return;
    }
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
      if (res.ok) {
        setClients((c) => c.filter((x) => x.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || "Failed to delete client");
      }
    } catch {
      setError("Failed to delete client");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/admin/clients");
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        } else {
          setError("Failed to fetch clients");
        }
      } catch (err) {
        setError("Error loading clients");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading clients...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Clients</h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
          Add Client
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Website
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Plan & pricing
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clients.length > 0 ? (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {client.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{client.email}</td>
                  <td className="px-6 py-4">
                    {client.siteUrl ? (
                      <a
                        href={client.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 underline text-sm"
                      >
                        {client.siteUrl.replace("https://", "").replace("http://", "")}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPlanLabel(client.pricingTier)}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {formatCatalogPricing(client.pricingTier, client.numSites)}
                      {(() => {
                        const monthly = formatMonthlyFromCents(
                          getActiveMonthlyCents(client.subscriptions)
                        );
                        return monthly ? ` · ${monthly} (Stripe)` : "";
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <a href={`/admin/clients/${client.id}`} className="text-primary-600 hover:text-primary-700 mr-4">
                      Edit
                    </a>
                    <button
                      type="button"
                      disabled={deletingId === client.id}
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {deletingId === client.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-600">
                  No clients yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
