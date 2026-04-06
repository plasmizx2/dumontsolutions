"use client";

import Link from "next/link";
import { useState } from "react";

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
    stripeProductId: "basic_site",
    highlighted: false,
  },
  {
    name: "Site + Maintenance",
    description: "Best for growing businesses",
    price: "$225",
    billingPeriod: "one-time + $60/month",
    features: [
      "Everything in Basic Site",
      "Monthly maintenance",
      "Security updates",
      "Performance optimization",
      "Monthly backups",
      "Priority support",
      "Unlimited revisions for 30 days",
    ],
    stripeProductId: "site_maintenance",
    highlighted: true,
  },
  {
    name: "Multi-Site + Maintenance",
    description: "For expanding operations",
    price: "$225",
    billingPeriod: "per site + $60/month",
    features: [
      "Everything in Site + Maintenance",
      "Manage multiple websites",
      "Centralized dashboard",
      "Bulk updates",
      "Advanced analytics",
      "Custom integrations",
      "Dedicated account manager",
    ],
    stripeProductId: "multi_site",
    highlighted: false,
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState("monthly");

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 text-center">
            Choose the plan that's right for your business
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-lg overflow-hidden transition transform hover:scale-105 ${
                  plan.highlighted
                    ? "border-2 border-primary-600 shadow-2xl md:scale-105"
                    : "border border-gray-200 shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-primary-600 text-white px-4 py-2 text-center font-semibold">
                    POPULAR
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <p className="text-gray-600 text-sm mt-2">
                      {plan.billingPeriod}
                    </p>
                  </div>

                  <button
                    className={`w-full py-3 rounded font-semibold transition mb-8 ${
                      plan.highlighted
                        ? "bg-primary-600 text-white hover:bg-primary-700"
                        : "border border-primary-600 text-primary-600 hover:bg-primary-50"
                    }`}
                  >
                    Get Started
                  </button>

                  <div className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="text-primary-600 mr-3 mt-1">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Feature Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b-2 border-gray-200">
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
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
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

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Can I upgrade my plan later?",
                a: "Yes! You can upgrade anytime. We'll adjust the pricing accordingly.",
              },
              {
                q: "What if I need more than one site for the basic plan?",
                a: "Upgrade to the Multi-Site + Maintenance plan to manage multiple websites.",
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a 14-day money-back guarantee if you're not satisfied with our work.",
              },
              {
                q: "Is the $60/month renewal guaranteed?",
                a: "Yes, our maintenance pricing is fixed. No hidden fees or unexpected increases.",
              },
              {
                q: "What's included in maintenance?",
                a: "Monthly updates, security patches, backups, performance optimization, and priority support.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
