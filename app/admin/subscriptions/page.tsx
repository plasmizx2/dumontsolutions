"use client";

import { useEffect, useState } from "react";

interface Subscription {
  id: number;
  clientId: number;
  client: { name: string };
  status: string;
  nextBillingDate: string | null;
  amountMonthly: number;
  createdAt: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch("/api/admin/subscriptions");
        if (response.ok) {
          const data = await response.json();
          setSubscriptions(data);
        }
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading subscriptions...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Subscriptions</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Client
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Monthly Amount
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Next Billing
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Since
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {sub.client.name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sub.status === "active"
                          ? "bg-green-100 text-green-800"
                          : sub.status === "past_due"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    ${(sub.amountMonthly / 100).toFixed(2)}/mo
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {sub.nextBillingDate
                      ? new Date(sub.nextBillingDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                  No subscriptions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
