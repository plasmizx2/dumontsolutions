"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role as "admin" | "client" | undefined;

  return (
    <nav className="sticky top-0 z-50">
      <div className="glass border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary-700 via-primary-500 to-blue-600 bg-clip-text text-transparent">
              DumontSolutions
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-slate-700 hover:text-slate-900 transition"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="text-slate-700 hover:text-slate-900 transition"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-slate-700 hover:text-slate-900 transition"
            >
              Contact
            </Link>
            {status !== "loading" && !session && (
              <>
                <Link href="/login" className="btn-primary px-4 py-2">
                  Login
                </Link>
              </>
            )}

            {session && role === "client" && (
              <>
                <Link href="/dashboard" className="btn-secondary px-4 py-2">
                  Dashboard
                </Link>
                <button onClick={() => signOut()} className="btn-primary px-4 py-2">
                  Sign Out
                </button>
              </>
            )}

            {session && role === "admin" && (
              <>
                <Link href="/admin" className="btn-secondary px-4 py-2">
                  Admin Dashboard
                </Link>
                <button onClick={() => signOut()} className="btn-primary px-4 py-2">
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {status !== "loading" && !session && (
              <Link href="/login" className="btn-primary px-3 py-2">
                Login
              </Link>
            )}
            <button
              className="rounded-lg p-2 hover:bg-white/60 transition"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <Link
              href="/"
              className="block text-slate-700 hover:text-slate-900 py-2"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="block text-slate-700 hover:text-slate-900 py-2"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="block text-slate-700 hover:text-slate-900 py-2"
            >
              Contact
            </Link>
            {status !== "loading" && !session && (
              <>
                <Link href="/login" className="btn-primary w-full">
                  Login
                </Link>
              </>
            )}

            {session && role === "client" && (
              <>
                <Link href="/dashboard" className="btn-secondary w-full">
                  Dashboard
                </Link>
                <button onClick={() => signOut()} className="btn-primary w-full">
                  Sign Out
                </button>
              </>
            )}

            {session && role === "admin" && (
              <>
                <Link href="/admin" className="btn-secondary w-full">
                  Admin Dashboard
                </Link>
                <button onClick={() => signOut()} className="btn-primary w-full">
                  Sign Out
                </button>
              </>
            )}
          </div>
        )}
      </div>
      </div>
    </nav>
  );
}
