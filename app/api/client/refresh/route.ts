import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth";
import { syncStripeDataForClient } from "@/lib/stripe-customer-sync";

export async function POST() {
  try {
    const session = await getServerSession(authConfig);
    const role = (session?.user as any)?.role as string | undefined;
    const clientId = (session?.user as any)?.clientId as number | undefined;

    if (!session || role !== "client" || !clientId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log(`Manual refresh requested for client: ${clientId}`);
    
    // Force a fresh sync
    await syncStripeDataForClient(clientId);

    return NextResponse.json({ 
      success: true, 
      message: "Data refreshed successfully" 
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh data" },
      { status: 500 }
    );
  }
}
