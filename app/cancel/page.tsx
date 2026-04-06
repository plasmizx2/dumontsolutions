import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "@/lib/auth";
import CancelSubscriptionClient from "./cancel-client";

const prisma = new PrismaClient();

export default async function CancelSubscriptionPage() {
  const session = await getServerSession(authConfig);
  const role = (session?.user as any)?.role as string | undefined;
  const clientId = (session?.user as any)?.clientId as number | undefined;

  if (!session || role !== "client" || !clientId) {
    redirect("/dashboard/login");
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!client) {
    redirect("/dashboard/login");
  }

  const activeSubscription = client.subscriptions.find(
    sub => sub.status === "active" || sub.status === "trialing"
  );

  if (!activeSubscription) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card p-8 sm:p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Subscription</h2>
            <p className="text-gray-600 mb-6">
              You don&apos;t have an active subscription to cancel. If you think this is a mistake, please contact support.
            </p>
            <a 
              href="/dashboard"
              className="inline-flex items-center text-primary-700 hover:text-primary-800 font-semibold"
            >
              Return to Dashboard →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <CancelSubscriptionClient subscription={activeSubscription} />;
}
