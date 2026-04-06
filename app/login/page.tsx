"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";

type Mode = "customer" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as Mode) || "customer";
  const next = searchParams.get("next") || undefined;

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMode(initialMode);
    setError("");
  }, [initialMode]);

  const title = useMemo(
    () => (mode === "admin" ? "Login (Admin)" : "Login"),
    [mode]
  );

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result =
        mode === "admin"
          ? await signIn("admin-credentials", {
              email,
              password,
              redirect: false,
            })
          : await signIn("client-credentials", {
              email,
              code,
              redirect: false,
            });

      if (!result?.ok) {
        setError(
          mode === "admin" ? "Invalid email or password" : "Invalid email or portal code"
        );
        return;
      }

      if (next) {
        router.push(next);
        return;
      }
      router.push(mode === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
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
              {title}
            </h1>
          </div>
          <p className="text-slate-600 mt-2">
            {mode === "admin"
              ? "Sign in to manage clients, payments, and subscriptions."
              : "Sign in with the portal code from your welcome email."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => router.push(`/login?mode=customer${next ? `&next=${encodeURIComponent(next)}` : ""}`)}
              className={mode === "customer" ? "btn-primary" : "btn-secondary"}
              disabled={loading}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => router.push(`/login?mode=admin${next ? `&next=${encodeURIComponent(next)}` : ""}`)}
              className={mode === "admin" ? "btn-primary" : "btn-secondary"}
              disabled={loading}
            >
              Admin
            </button>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="you@company.com"
              />
            </div>

            {mode === "admin" ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Portal Code
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  placeholder="e.g. DS-4K8P-2M9Q"
                />
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Spinner />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

