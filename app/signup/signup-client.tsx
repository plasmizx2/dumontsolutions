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
    <div className="relative overflow-hidden min-h-[82vh] flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-primary-400/25 blur-3xl animate-float" />
        <div className="absolute -top-16 right-[-180px] h-[620px] w-[620px] rounded-full bg-blue-500/20 blur-3xl animate-float-slow" />
        <div className="absolute bottom-[-220px] left-[-180px] h-[520px] w-[520px] rounded-full bg-emerald-500/15 blur-3xl animate-float" />
      </div>

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="card p-8 sm:p-10">
            <p className="inline-flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-primary-700 bg-primary-50/70 border border-primary-200/60 px-3 py-1.5 rounded-full">
              DumontSolutions Portal
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
              Create your account
            </h1>
            <p className="mt-4 text-slate-600 text-lg">
              Sign up with Google to access your dashboard, manage billing, and
              purchase a plan securely through Stripe.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={continueWithGoogle}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Sign up with Google
                  </>
                )}
              </button>
              <p className="mt-3 text-xs text-slate-500">
                By continuing, you agree to our terms and acknowledge our refund
                policy.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                  className="link-fancy text-primary-700 font-semibold"
                >
                  Sign in
                </Link>
              </p>
              <Link
                href="/pricing"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                View pricing
              </Link>
            </div>
          </div>

          <div className="card p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute inset-0 -z-10">
              <div className="absolute -top-24 right-[-160px] h-[420px] w-[420px] rounded-full bg-primary-400/15 blur-3xl" />
              <div className="absolute bottom-[-160px] left-[-160px] h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              What you get
            </h2>
            <p className="mt-2 text-slate-600">
              A clean client portal that keeps everything in one place.
            </p>

            <div className="mt-6 space-y-4">
              {[
                {
                  t: "Fast checkout",
                  d: "Sign in once, apply promo codes, and checkout with Stripe.",
                },
                {
                  t: "Client dashboard",
                  d: "View payments, manage billing, and add project details.",
                },
                {
                  t: "Support-ready",
                  d: "We can see what you bought and where your project is at.",
                },
              ].map((b) => (
                <div
                  key={b.t}
                  className="rounded-2xl border border-slate-200/70 bg-white/70 p-5"
                >
                  <p className="font-bold text-slate-900">{b.t}</p>
                  <p className="mt-1 text-sm text-slate-600">{b.d}</p>
                </div>
              ))}
            </div>

            {plan && (
              <div className="mt-6 rounded-2xl border border-primary-200/60 bg-primary-50/40 p-5">
                <p className="text-sm font-semibold text-primary-800">
                  You&apos;re about to choose a plan next.
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  After signup, we&apos;ll send you back to pricing automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
