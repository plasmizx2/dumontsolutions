"use client";

import { FormEvent, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";

const PLANS = ["basic_site", "site_maintenance", "multi_site"] as const;

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");

  const selectedPlan = useMemo(() => {
    if (!planParam || !PLANS.includes(planParam as (typeof PLANS)[number])) {
      return null;
    }
    return planParam;
  }, [planParam]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          company: company.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Could not register");
      }

      const result = await signIn("client-password", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!result?.ok) {
        throw new Error("Account created but sign-in failed. Try logging in.");
      }

      if (selectedPlan) {
        router.push(`/pricing?checkout=${encodeURIComponent(selectedPlan)}`);
        router.refresh();
        return;
      }
      router.push("/pricing");
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="card p-8 sm:p-10">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="text-slate-600 mt-2">
            Sign up before you purchase. After checkout, you&apos;ll return to
            your dashboard to add project details.
          </p>
          {selectedPlan && (
            <p className="mt-3 text-sm font-medium text-primary-700">
              Plan selected:{" "}
              <span className="capitalize">
                {selectedPlan.replace(/_/g, " ")}
              </span>{" "}
              — you&apos;ll continue to checkout next.
            </p>
          )}

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="you@company.com"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  placeholder="8+ characters"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  placeholder="Repeat password"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Company <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="+1 (555) 000-0000"
              />
            </div>

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
                  Creating account…
                </>
              ) : (
                "Sign up & continue"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="link-fancy text-primary-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
