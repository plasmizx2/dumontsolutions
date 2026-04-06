"use client";

import { useEffect, useState } from "react";
import {
  calculateDaysRemaining,
  getCountdownText,
  getCountdownColor,
  formatBillingDate,
} from "@/lib/renewals";

interface DashboardStats {
  totalRevenue: number;
  activeSubscriptions: number;
  totalClients: number;
  recentOrders: Array<{
    id: number;
    clientName: string;
    amount: number;
    type: string;
    date: string;
  }>;
  upcomingRenewals: Array<{
    clientId: number;
    clientName: string;
    email: string;
    nextBillingDate: string;
    amount: number;
    siteUrl?: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-600">Failed to load dashboard</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Total Revenue
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            ${(stats.totalRevenue / 100).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Active Subscriptions
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.activeSubscriptions}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">
            Total Clients
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalClients}
          </p>
        </div>
      </div>

      {/* Upcoming Renewals */}
      {stats.upcomingRenewals.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8 border-l-4 border-red-500">
          <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
            <h2 className="text-xl font-bold text-red-900">
              ⏰ Upcoming Renewals (Next 7 Days)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Renewal Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Countdown
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Site
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.upcomingRenewals.map((renewal) => {
                  const daysRemaining = calculateDaysRemaining(
                    new Date(renewal.nextBillingDate)
                  );
                  const countdownText = getCountdownText(daysRemaining);
                  const color = getCountdownColor(daysRemaining);

                  const colorClasses = {
                    red: "bg-red-100 text-red-800",
                    yellow: "bg-yellow-100 text-yellow-800",
                    green: "bg-green-100 text-green-800",
                  };

                  return (
                    <tr key={renewal.clientId} className="hover:bg-red-50">
                      <td className="px-6 py-3 text-gray-900 font-medium">
                        {renewal.clientName}
                      </td>
                      <td className="px-6 py-3 text-gray-600 text-sm">
                        {renewal.email}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {formatBillingDate(new Date(renewal.nextBillingDate))}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            colorClasses[color]
                          }`}
                        >
                          {countdownText}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-900 font-medium">
                        ${(renewal.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-3">
                        {renewal.siteUrl ? (
                          <a
                            href={renewal.siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 underline text-sm"
                          >
                            Visit Site →
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">Not set</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-900">
                      {order.clientName}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {order.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-900">
                      ${(order.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-sm">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-600">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
