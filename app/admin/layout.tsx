"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [mounted, status, router]);

  if (!mounted || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Admin</h2>
        </div>

        <nav className="space-y-4 mb-12">
          <Link
            href="/admin"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/clients"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Clients
          </Link>
          <Link
            href="/admin/subscriptions"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Subscriptions
          </Link>
          <Link
            href="/admin/payments"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Payments
          </Link>
          <Link
            href="/admin/cancellations"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Cancellations
          </Link>
        </nav>

        <div className="border-t border-gray-700 pt-4">
          <p className="text-sm text-gray-400 mb-4">{session.user?.email}</p>
          <button
            onClick={() => signOut()}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
