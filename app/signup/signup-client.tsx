"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";

export default function SignupClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || undefined;
  const plan = searchParams.get("plan") || undefined;

  const callbackUrl = useMemo(() => {
    const n =
      next ||
      (plan ? `/pricing?checkout=${encodeURIComponent(plan)}` : undefined) ||
      "/dashboard";
    return `/post-login?next=${encodeURIComponent(n)}`;
  }, [next, plan]);

  const [loading, setLoading] = useState(false);

  const continueWithGoogle = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary-400/20 blur-3xl animate-float" />
        <div className="absolute -top-16 right-[-140px] h-[520px] w-[520px] rounded-full bg-blue-500/15 blur-3xl animate-float-slow" />
      </div>

      <div className="w-full max-w-xl">
        <div className="card p-8 sm:p-10">
          <div className="flex items-start justify-between gap-6 flex-col sm:flex-row">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Create your account
              </h1>
              <p className="text-slate-600 mt-3">
                Sign up in one click with Google. We&apos;ll create your account
                automatically and send you to your dashboard.
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <button
                type="button"
                onClick={continueWithGoogle}
                disabled={loading}
                className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Redirecting…
                  </>
                ) : (
                  "Sign up with Google"
                )}
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                t: "Fast checkout",
                d: "Sign in once, then buy a plan securely through Stripe.",
              },
              {
                t: "Client dashboard",
                d: "View payments, manage billing, and add project details.",
              },
              {
                t: "Admin controls",
                d: "Admins get access automatically based on their email.",
              },
            ].map((b) => (
              <div key={b.t} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                <p className="font-bold text-slate-900">{b.t}</p>
                <p className="mt-1 text-sm text-slate-600">{b.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between flex-col sm:flex-row gap-3">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                className="link-fancy text-primary-700 font-semibold"
              >
                Sign in
              </Link>
            </p>
            <Link href="/pricing" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              View pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
