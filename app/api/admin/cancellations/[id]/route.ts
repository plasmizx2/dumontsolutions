import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cancellation = await prisma.subscription.findUnique({
      where: { id: parseInt(id) },
      include: { client: true },
    });

    if (!cancellation) {
      return NextResponse.json(
        { error: "Cancellation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(cancellation);
  } catch (error) {
    console.error("Cancellation fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cancellation" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, githubRepoUrl, notes, deliveryDate } = await request.json();

    const updateData: any = {};

    if (status) {
      updateData.codeDeliveryStatus = status;
    }
    if (githubRepoUrl) {
      updateData.githubRepoUrl = githubRepoUrl;
    }
    if (notes) {
      updateData.cancellationNotes = notes;
    }
    if (deliveryDate) {
      updateData.codeDeliveryDate = new Date(deliveryDate);
    }

    const cancellation = await prisma.subscription.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { client: true },
    });

    return NextResponse.json(cancellation);
  } catch (error) {
    console.error("Cancellation update error:", error);
    return NextResponse.json(
      { error: "Failed to update cancellation" },
      { status: 500 }
    );
  }
}
