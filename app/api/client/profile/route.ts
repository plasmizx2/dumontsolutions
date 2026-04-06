import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string })?.role;
  const clientId = (session?.user as { clientId?: number })?.clientId;

  if (!session || role !== "client" || !clientId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const company =
      body.company !== undefined ? String(body.company).trim() || null : undefined;
    const phone =
      body.phone !== undefined ? String(body.phone).trim() || null : undefined;
    let siteUrl: string | null | undefined =
      body.siteUrl !== undefined ? String(body.siteUrl).trim() || null : undefined;

    if (siteUrl && !/^https?:\/\//i.test(siteUrl)) {
      siteUrl = `https://${siteUrl}`;
    }

    const data: Record<string, unknown> = {};
    if (company !== undefined) data.company = company;
    if (phone !== undefined) data.phone = phone;
    if (siteUrl !== undefined) data.siteUrl = siteUrl;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const client = await prisma.client.update({
      where: { id: clientId },
      data,
    });

    return NextResponse.json({
      ok: true,
      client: {
        company: client.company,
        phone: client.phone,
        siteUrl: client.siteUrl,
      },
    });
  } catch (e) {
    console.error("Profile update error:", e);
    return NextResponse.json(
      { error: "Could not save profile." },
      { status: 500 }
    );
  }
}
