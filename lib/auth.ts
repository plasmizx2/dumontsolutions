import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On Google sign-in, NextAuth populates token.email/name.
      const email = (token.email || (user as any)?.email || "") as string;
      const name = (token.name || (user as any)?.name || "") as string;

      const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
      if (adminEmail && email.toLowerCase() === adminEmail) {
        token.role = "admin";
        token.clientId = undefined;
        return token;
      }

      if (email) {
        // Ensure there is a Client row for every signed-in customer.
        let client = await prisma.client.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!client) {
          client = await prisma.client.create({
            data: {
              name: name || "Customer",
              email: email.toLowerCase(),
              pricingTier: "pending",
              numSites: 1,
            },
          });
        }

        token.role = "client";
        token.clientId = client.id;
      }

      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = token.role;
      (session.user as any).clientId = token.clientId;
      return session;
    },
  },
};
