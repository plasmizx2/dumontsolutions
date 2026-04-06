import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authConfig: NextAuthOptions = {
  providers: [
    Credentials({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.isAdmin) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          role: "admin",
        };
      },
    }),
    Credentials({
      id: "client-credentials",
      name: "Client Portal Code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Portal Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          return null;
        }

        const client = await prisma.client.findUnique({
          where: { email: credentials.email as string },
        });

        if (!client?.portalCodeHash) {
          return null;
        }

        const codeMatch = await bcrypt.compare(
          credentials.code as string,
          client.portalCodeHash
        );

        if (!codeMatch) {
          return null;
        }

        return {
          id: `client:${client.id}`,
          email: client.email,
          role: "client",
          clientId: client.id,
        };
      },
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
      if (user) {
        token.role = (user as any).role;
        token.clientId = (user as any).clientId;
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
