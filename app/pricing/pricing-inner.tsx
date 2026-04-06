"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import SignupModal from "@/components/SignupModal";

type PlanId = "basic_site" | "site_maintenance" | "multi_site";

const pricingPlans = [
  {
    name: "Basic Site",
    description: "Perfect for getting started",
    price: "$225",
    billingPeriod: "one-time",
    features: [
      "Professional website design",
      "Fully responsive layout",
      "Up to 5 pages",
      "Contact form",
      "SEO optimization",
      "SSL certificate",
    ],
    stripeProductId: "basic_site" as PlanId,
    highlighted: false,
  },
  {
    name: "Site + Maintenance",
    description: "Best for growing businesses",
    price: "$225",
    billingPeriod: "one-time + $225/month",
    features: [
      "Everything in Basic Site",
      "Monthly maintenance",
      "Security updates",
      "Performance optimization",
      "Monthly backups",
      "Priority support",
      "Unlimited revisions for 30 days",
    ],
    stripeProductId: "site_maintenance" as PlanId,
    highlighted: true,
  },
  {
    name: "Multi-Site + Maintenance",
    description: "For expanding operations",
    price: "$175",
    billingPeriod: "per site + $50/month",
    features: [
      "Everything in Site + Maintenance",
      "Manage multiple websites",
      "Centralized dashboard",
      "Bulk updates",
      "Advanced analytics",
      "Custom integrations",
      "Dedicated account manager",
    ],
    stripeProductId: "multi_site" as PlanId,
    highlighted: false,
  },
];

export default function PricingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string })?.role;

  const [signupOpen, setSignupOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: PlanId;
    name: string;
  } | null>(null);

  useEffect(() => {
    const checkoutPlan = searchParams.get("checkout");
    if (
      !checkoutPlan ||
      status !== "authenticated" ||
      role !== "client"
    ) {
      return;
    }
    const found = pricingPlans.find((p) => p.stripeProductId === checkoutPlan);
    if (found) {
      setSelectedPlan({ id: found.stripeProductId, name: found.name });
      setSignupOpen(true);
      router.replace("/pricing", { scroll: false });
    }
  }, [searchParams, status, role, router]);

  const startPlan = (plan: (typeof pricingPlans)[0]) => {
    if (status === "loading") return;
    if (!session || role !== "client") {
      router.push(
        `/signup?next=${encodeURIComponent(
          `/pricing?checkout=${plan.stripeProductId}`
        )}`
      );
      return;
    }
    setSelectedPlan({ id: plan.stripeProductId, name: plan.name });
    setSignupOpen(true);
  };

  return (
    <div>
      <SignupModal
        open={signupOpen}
        plan={selectedPlan}
        onClose={() => setSignupOpen(false)}
      />

      <section className="relative overflow-hidden py-14 sm:py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary-400/20 blur-3xl animate-float" />
          <div className="absolute -top-16 right-[-140px] h-[520px] w-[520px] rounded-full bg-blue-500/15 blur-3xl animate-float-slow" />
        </div>
        <div className="container-page text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Create an account first, then choose a plan. Checkout is handled
            securely by Stripe.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`card card-hover overflow-hidden ${
                  plan.highlighted
                    ? "ring-2 ring-primary-400/70 md:scale-[1.02]"
                    : ""
                }`}
              >
                {plan.highlighted && (
                  <div
                    className="text-white px-4 py-2 text-center font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg,#0284c7,#0ea5e9,#2563eb)",
                    }}
                  >
                    POPULAR
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-slate-600 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <p className="text-slate-600 text-sm mt-2">
                      {plan.billingPeriod}
                    </p>
                  </div>

                  <button
                    type="button"
                    className={`w-full mb-8 ${
                      plan.highlighted ? "btn-primary" : "btn-secondary"
                    }`}
                    onClick={() => startPlan(plan)}
                  >
                    {status === "loading" ? "Loading..." : "Get Started"}
                  </button>

                  <div className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="text-primary-600 mr-3 mt-1">✓</span>
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <h2 className="text-3xl font-black tracking-tight text-center mb-12">
            Feature Comparison
          </h2>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/70 border-b border-slate-200">
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Basic Site
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Site + Maintenance
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Multi-Site
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Professional Design", true, true, true],
                  ["Responsive Layout", true, true, true],
                  ["Monthly Maintenance", false, true, true],
                  ["Security Updates", false, true, true],
                  ["Priority Support", false, true, true],
                  ["Multiple Websites", false, false, true],
                  ["Advanced Analytics", false, false, true],
                  ["Dedicated Manager", false, false, true],
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white/70" : "bg-slate-50/60"}
                  >
                    <td className="px-6 py-4 text-left">{row[0]}</td>
                    <td className="px-6 py-4 text-center">
                      {row[1] ? "✓" : "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row[2] ? "✓" : "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row[3] ? "✓" : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Can I upgrade my plan later?",
                a: "Yes! You can upgrade anytime. We&apos;ll adjust the pricing accordingly.",
              },
              {
                q: "What if I need more than one site for the basic plan?",
                a: "Upgrade to the Multi-Site + Maintenance plan to manage multiple websites.",
              },
              {
                q: "Do you offer refunds?",
                a: "We do not accept refunds. All sales are final once work has begun or access has been delivered.",
              },
              {
                q: "Is the monthly renewal price guaranteed?",
                a: "Yes, our maintenance pricing is fixed. No hidden fees or unexpected increases.",
              },
              {
                q: "What&apos;s included in maintenance?",
                a: "Monthly updates, security patches, backups, performance optimization, and priority support.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="card p-6">
                <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
