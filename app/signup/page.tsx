import { Suspense } from "react";
import SignupClient from "./signup-client";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-24 text-center text-slate-600">
          Loading…
        </div>
      }
    >
      <SignupClient />
    </Suspense>
  );
}
