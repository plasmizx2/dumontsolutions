import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";

export default async function PostLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string })?.role;

  if (!session || !role) {
    redirect("/login");
  }

  const { next } = await searchParams;

  // Only allow internal next redirects.
  if (next && next.startsWith("/")) {
    redirect(next);
  }

  redirect(role === "admin" ? "/admin" : "/dashboard");
}

