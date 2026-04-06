import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cancellation = await prisma.subscription.findUnique({
      where: { id: parseInt(params.id) },
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
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
      where: { id: parseInt(params.id) },
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
