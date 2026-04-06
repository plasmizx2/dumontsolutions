import { Suspense } from "react";
import LoginClient from "./login-client";

function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="card p-8 sm:p-10">
          <div className="flex items-center gap-3 text-slate-700">
            <span className="spinner inline-block h-5 w-5 rounded-full border-2 border-slate-400/60 border-t-slate-900" />
            <span className="text-lg font-semibold">Loading…</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginClient />
    </Suspense>
  );
}

