"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || undefined;

  const [loading, setLoading] = useState(false);

  const continueWithGoogle = async () => {
    setLoading(true);
    try {
      await signIn("google", {
        callbackUrl: `/post-login${next ? `?next=${encodeURIComponent(next)}` : ""}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-[82vh] flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-primary-400/22 blur-3xl animate-float" />
        <div className="absolute -top-20 right-[-180px] h-[620px] w-[620px] rounded-full bg-blue-500/18 blur-3xl animate-float-slow" />
      </div>

      <div className="w-full max-w-lg">
        <div className="card p-8 sm:p-10">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-primary-700 bg-primary-50/70 border border-primary-200/60 px-3 py-1.5 rounded-full">
            DumontSolutions Portal
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="text-slate-600 mt-3 text-lg">
            Sign in with Google to access your dashboard.
          </p>

          <button
            type="button"
            onClick={continueWithGoogle}
            disabled={loading}
            className="btn-primary w-full mt-7 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Spinner />
                Redirecting…
              </>
            ) : (
              <>
                <span
                  aria-hidden
                  className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/25"
                >
                  G
                </span>
                Continue with Google
              </>
            )}
          </button>

          <div className="mt-6 flex items-center justify-between gap-3 flex-col sm:flex-row">
            <p className="text-sm text-slate-600">
              New here?{" "}
              <Link
                href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                className="link-fancy text-primary-700 font-semibold"
              >
                Create an account
              </Link>
            </p>
            <Link
              href="/pricing"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              View pricing
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Trouble signing in? Try a different Google account or contact
            support.
          </p>
        </div>
      </div>
    </div>
  );
}
