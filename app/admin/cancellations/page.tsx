"use client";

import { useEffect, useState } from "react";
import {
  getDeliveryMethodText,
  formatCancellationStatus,
  calculateDaysSinceCancellation,
  getStatusColor,
} from "@/lib/cancellation";

interface Cancellation {
  id: number;
  clientId: number;
  client: { name: string; email: string };
  canceledAt: string;
  codeDeliveryMethod: string;
  codeDeliveryStatus: string;
  codeDeliveryDate?: string;
  cancellationNotes?: string;
  githubRepoUrl?: string;
}

export default function CancellationsPage() {
  const [cancellations, setCancellations] = useState<Cancellation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Cancellation>>({});

  useEffect(() => {
    const fetchCancellations = async () => {
      try {
        const response = await fetch("/api/admin/cancellations");
        if (response.ok) {
          const data = await response.json();
          setCancellations(data);
        }
      } catch (error) {
        console.error("Failed to fetch cancellations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCancellations();
  }, []);

  const handleMarkAsSent = async (cancellationId: number, githubUrl?: string) => {
    try {
      const response = await fetch(`/api/admin/cancellations/${cancellationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "sent",
          githubRepoUrl: githubUrl,
          deliveryDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Refresh list
        const data = await response.json();
        setCancellations(
          cancellations.map((c) => (c.id === cancellationId ? data : c))
        );
        setEditingId(null);
      }
    } catch (error) {
      console.error("Failed to update cancellation:", error);
    }
  };

  const handleMarkAsDelivered = async (cancellationId: number) => {
    try {
      const response = await fetch(`/api/admin/cancellations/${cancellationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "delivered",
        }),
      });

      if (response.ok) {
        // Refresh list
        const data = await response.json();
        setCancellations(
          cancellations.map((c) => (c.id === cancellationId ? data : c))
        );
      }
    } catch (error) {
      console.error("Failed to update cancellation:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading cancellations...</div>;
  }

  const pendingCancellations = cancellations.filter(
    (c) => c.codeDeliveryStatus !== "delivered"
  );

  const overdueCancellations = pendingCancellations.filter(
    (c) => calculateDaysSinceCancellation(new Date(c.canceledAt)) > 7
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Cancellations & Code Delivery</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pending Delivery</p>
            <p className="text-3xl font-bold text-gray-900">{pendingCancellations.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Overdue (&gt;7 days)</p>
            <p className="text-3xl font-bold text-red-600">{overdueCancellations.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {cancellations.filter((c) => c.codeDeliveryStatus === "delivered").length}
            </p>
          </div>
        </div>
      </div>

      {overdueCancellations.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow mb-8 p-4">
          <p className="text-red-900 font-bold">
            🔴 {overdueCancellations.length} Overdue Code Deliveries
          </p>
          <p className="text-red-700 text-sm">
            These cancellations are more than 7 days old and need immediate attention!
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Pending Code Deliveries</h2>
        </div>

        {pendingCancellations.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-600">
            No pending cancellations. All code has been delivered! ✓
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Canceled
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Days Ago
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Delivery Method
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingCancellations.map((cancellation) => {
                  const daysSince = calculateDaysSinceCancellation(
                    new Date(cancellation.canceledAt)
                  );
                  const color = getStatusColor(
                    cancellation.codeDeliveryStatus || "pending",
                    daysSince
                  );

                  const colorClasses = {
                    red: "bg-red-100 text-red-800",
                    yellow: "bg-yellow-100 text-yellow-800",
                    green: "bg-green-100 text-green-800",
                    gray: "bg-gray-100 text-gray-800",
                  };

                  return (
                    <tr key={cancellation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {cancellation.client.name}
                        <br />
                        <span className="text-sm text-gray-600">
                          {cancellation.client.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(cancellation.canceledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            colorClasses[color as keyof typeof colorClasses]
                          }`}
                        >
                          {daysSince} days
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {getDeliveryMethodText(cancellation.codeDeliveryMethod)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{formatCancellationStatus(cancellation.codeDeliveryStatus)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {cancellation.codeDeliveryStatus === "pending" && (
                          <>
                            {cancellation.codeDeliveryMethod === "github" ? (
                              <>
                                {editingId === cancellation.id ? (
                                  <div className="flex gap-2">
                                    <input
                                      type="url"
                                      placeholder="GitHub URL"
                                      value={editData.githubRepoUrl || ""}
                                      onChange={(e) =>
                                        setEditData({
                                          ...editData,
                                          githubRepoUrl: e.target.value,
                                        })
                                      }
                                      className="px-2 py-1 border border-gray-300 rounded text-sm flex-1"
                                    />
                                    <button
                                      onClick={() =>
                                        handleMarkAsSent(
                                          cancellation.id,
                                          editData.githubRepoUrl
                                        )
                                      }
                                      className="text-primary-600 hover:text-primary-700 font-semibold"
                                    >
                                      Send
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingId(cancellation.id);
                                      setEditData({
                                        githubRepoUrl: cancellation.githubRepoUrl,
                                      });
                                    }}
                                    className="text-primary-600 hover:text-primary-700"
                                  >
                                    Send GitHub Link
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => handleMarkAsSent(cancellation.id)}
                                className="text-primary-600 hover:text-primary-700"
                              >
                                Mark as Shipped
                              </button>
                            )}
                          </>
                        )}
                        {cancellation.codeDeliveryStatus === "sent" && (
                          <button
                            onClick={() => handleMarkAsDelivered(cancellation.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            Confirm Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {cancellations.some((c) => c.codeDeliveryStatus === "delivered") && (
        <>
          <h2 className="text-2xl font-bold mt-12 mb-6">Completed Deliveries</h2>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Canceled
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Delivered
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cancellations
                  .filter((c) => c.codeDeliveryStatus === "delivered")
                  .map((cancellation) => (
                    <tr key={cancellation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {cancellation.client.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(cancellation.canceledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {getDeliveryMethodText(cancellation.codeDeliveryMethod)}
                      </td>
                      <td className="px-6 py-4 text-green-600 font-semibold">
                        ✓ Delivered
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
