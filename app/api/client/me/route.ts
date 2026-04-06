import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string })?.role;
  const clientId = (session?.user as { clientId?: number })?.clientId;

  if (!session || role !== "client" || !clientId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      phone: true,
      siteUrl: true,
      pricingTier: true,
      numSites: true,
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(client);
}
