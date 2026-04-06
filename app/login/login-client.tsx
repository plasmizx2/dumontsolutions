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
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="card p-8 sm:p-10">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Sign in
            </h1>
          </div>
          <p className="text-slate-600 mt-2">
            Continue with Google. If your email is{" "}
            <span className="font-semibold">seandumont2005@gmail.com</span>{" "}
            you&apos;ll be signed in as admin automatically.
          </p>

          <button
            type="button"
            onClick={continueWithGoogle}
            disabled={loading}
            className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Spinner />
                Redirecting…
              </>
            ) : (
              "Continue with Google"
            )}
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Having trouble? Try a different Google account or contact support.
          </p>

          <div className="mt-6 text-center text-xs text-slate-500">
            <Link href="/pricing" className="link-fancy text-primary-700">
              View pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
