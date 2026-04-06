import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "@/lib/auth";
import { syncStripeDataForClient } from "@/lib/stripe-customer-sync";
import BillingPortalButton from "@/components/BillingPortalButton";
import DashboardShell from "./dashboard-shell";

const prisma = new PrismaClient();

export default async function CustomerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const session = await getServerSession(authConfig);
  const role = (session?.user as any)?.role as string | undefined;
  const clientId = (session?.user as any)?.clientId as number | undefined;

  if (!session || role !== "client" || !clientId) {
    redirect("/dashboard/login");
  }

  let client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      payments: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!client) {
    redirect("/dashboard/login");
  }

  if (
    process.env.STRIPE_SECRET_KEY &&
    (client.payments.length === 0 || client.subscriptions.length === 0)
  ) {
    try {
      await syncStripeDataForClient(clientId);
      const refreshed = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
          subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
          payments: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      });
      if (refreshed) client = refreshed;
    } catch (e) {
      console.error("syncStripeDataForClient:", e);
    }
  }

  const subscription = client.subscriptions[0];

  return (
    <div className="container-page py-14">
      <DashboardShell
        checkoutSuccess={checkout === "success"}
        initialCompany={client.company}
        initialPhone={client.phone}
      />

      <div className="flex items-start justify-between gap-6 flex-col sm:flex-row">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Your Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your subscription, view billing, and access your site details.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/cancel" className="btn-secondary text-center">
            Cancel subscription
          </Link>
          <BillingPortalButton />
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card p-8 lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Subscription
          </h2>
          {subscription ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="font-semibold text-slate-900">{subscription.status}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Monthly amount</p>
                <p className="font-semibold text-slate-900">
                  ${(subscription.amountMonthly / 100).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Current period</p>
                <p className="font-semibold text-slate-900">
                  {subscription.currentPeriodStart.toLocaleDateString()} –{" "}
                  {subscription.currentPeriodEnd.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Next billing date</p>
                <p className="font-semibold text-slate-900">
                  {(subscription.nextBillingDate ?? subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-600">
              No active subscription found. If you think this is a mistake, contact support.
            </p>
          )}
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Your Site</h2>
          {client.siteUrl ? (
            <div className="space-y-3">
              <p className="text-slate-600 break-words">{client.siteUrl}</p>
              <a
                href={client.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center"
              >
                Visit site
              </a>
            </div>
          ) : (
            <p className="text-slate-600">
              Your site link hasn’t been added yet. We’ll update it as soon as it’s ready.
            </p>
          )}
        </div>

        {subscription?.status === "canceled" && subscription.canceledAt && (
          <div className="card p-8 lg:col-span-3">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Code Delivery Status
            </h2>
            <p className="text-slate-600 mb-6">
              You keep full ownership of your code. We’ll deliver it based on the method you selected.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-500">Canceled</p>
                <p className="font-semibold text-slate-900">
                  {subscription.canceledAt.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Delivery method</p>
                <p className="font-semibold text-slate-900">
                  {subscription.codeDeliveryMethod || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="font-semibold text-slate-900">
                  {subscription.codeDeliveryStatus || "pending"}
                </p>
              </div>
            </div>
            {subscription.githubRepoUrl && (
              <div className="mt-6">
                <p className="text-sm text-slate-500">GitHub repo</p>
                <a
                  href={subscription.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-fancy text-primary-700 break-words"
                >
                  {subscription.githubRepoUrl}
                </a>
              </div>
            )}
          </div>
        )}

        <div className="card p-8 lg:col-span-3">
          <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
            <h2 className="text-xl font-bold text-slate-900">Recent Payments</h2>
            <p className="text-sm text-slate-500">{client.email}</p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Type</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Receipt / invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {client.payments.length > 0 ? (
                  client.payments.map((p) => (
                    <tr key={p.id} className="text-slate-700">
                      <td className="py-3 pr-4">
                        {p.paidAt ? p.paidAt.toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 pr-4">{p.paymentType}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-900">
                        ${(p.amount / 100).toFixed(2)}
                      </td>
                      <td className="py-3 pr-4 max-w-[14rem]">
                        {p.invoiceUrl ? (
                          <a
                            href={p.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-fancy text-primary-700"
                          >
                            View receipt
                          </a>
                        ) : (
                          <span className="text-slate-500 text-xs leading-snug">
                            No link stored — use{" "}
                            <span className="text-slate-700 font-medium">
                              Manage Billing
                            </span>{" "}
                            for invoices, or check your email.
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-slate-600" colSpan={4}>
                      <p>No payments recorded yet.</p>
                      <p className="mt-2 text-sm text-slate-500">
                        We pull payments from Stripe when you load this page (by your
                        account email and by checkout metadata). If you paid while signed
                        into a <span className="font-medium text-slate-700">different</span>{" "}
                        Google account than this one, they won&apos;t show here. Test and
                        live mode must also match your{" "}
                        <span className="font-medium text-slate-700">Stripe keys</span> on
                        the server. Use{" "}
                        <span className="font-medium text-slate-700">Manage Billing</span>{" "}
                        to see charges in Stripe.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

