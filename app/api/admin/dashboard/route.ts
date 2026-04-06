import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { filterUpcomingRenewals } from "@/lib/renewals";

const prisma = new PrismaClient();

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total revenue
    const payments = await prisma.payment.findMany({
      where: { status: "succeeded" },
    });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Get active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: "active" },
    });

    // Get total clients
    const totalClients = await prisma.client.count();

    // Get recent orders (payments)
    const recentPayments = await prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { client: true },
    });

    const recentOrders = recentPayments.map((p) => ({
      id: p.id,
      clientName: p.client.name,
      amount: p.amount,
      type: p.paymentType,
      date: p.paidAt?.toISOString() || p.createdAt.toISOString(),
    }));

    // Get upcoming renewals (next 7 days)
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "active",
        nextBillingDate: { not: null },
      },
      include: { client: true },
    });

    const upcomingRenewals = filterUpcomingRenewals(subscriptions, 7).map((renewal) => ({
      clientId: renewal.clientId,
      clientName: renewal.clientName,
      email: renewal.email,
      nextBillingDate: renewal.nextBillingDate.toISOString(),
      amount: renewal.amountMonthly || 0,
      siteUrl: renewal.siteUrl || undefined,
    }));

    return NextResponse.json({
      totalRevenue,
      activeSubscriptions,
      totalClients,
      recentOrders,
      upcomingRenewals,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
