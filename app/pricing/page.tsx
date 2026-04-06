import { Suspense } from "react";
import PricingInner from "./pricing-inner";

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-24 text-center text-slate-600">
          Loading pricing…
        </div>
      }
    >
      <PricingInner />
    </Suspense>
  );
}
