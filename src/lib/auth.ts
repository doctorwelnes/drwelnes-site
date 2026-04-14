import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getPrismaClient } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(getPrismaClient()),
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email / Telegram / phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const rawIdentifier = credentials?.identifier?.trim();
        const password = credentials?.password;

        if (!rawIdentifier || !password) {
          return null;
        }

        const prisma = getPrismaClient();

        const normalizedEmail = rawIdentifier.toLowerCase();
        const normalizedTelegram = rawIdentifier.replace(/^@/, "").toLowerCase();
        const normalizedPhone = rawIdentifier.replace(/[\s\-()]+/g, "");

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: normalizedEmail },
              { telegram: normalizedTelegram },
              { telegram: `@${normalizedTelegram}` },
              { phone: normalizedPhone },
              { phone: rawIdentifier },
            ],
          },
        });

        if (!user) {
          throw new Error("Неверный логин");
        }

        if (!user.passwordHash) {
          throw new Error("Неверный логин");
        }

        const ok = await bcrypt.compare(password, user.passwordHash);

        if (!ok) {
          throw new Error("Неверный пароль");
        }

        const userWithTelegram = user as typeof user & { telegram?: string | null };

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          image: user.image,
          phone: user.phone,
          telegram: userWithTelegram.telegram,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const userWithTelegram = user as typeof user & { telegram?: string | null };
        token.sub = user.id;
        token.email = user.email;
        token.role = user.role;
        token.image = user.image;
        token.name = user.name;
        token.phone = user.phone;
        token.telegram = userWithTelegram.telegram;
      }
      // Handle session update trigger
      if (trigger === "update") {
        if (session?.name) {
          token.name = session.name;
        }
        if (session?.image !== undefined) {
          token.image = session.image;
        }
        if (session?.phone !== undefined) {
          token.phone = session.phone;
        }
        if (session?.telegram !== undefined) {
          token.telegram = session.telegram;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {};
      session.user.id = token.sub;
      session.user.email = token.email;
      session.user.role = token.role;
      session.user.image = token.image;
      session.user.name = token.name;
      session.user.phone = token.phone;
      session.user.telegram = token.telegram;
      return session;
    },
  },
};
