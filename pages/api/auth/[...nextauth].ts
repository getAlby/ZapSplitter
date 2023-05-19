import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { User } from "@prisma/client";
import { createWebhook } from "lib/server/createWebhook";
import { prismaClient } from "lib/server/prisma";
import NextAuth, { AuthOptions } from "next-auth";
import { albyProvider } from "pages/api/auth/providers/alby";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prismaClient),
  providers: [albyProvider],
  callbacks: {
    async session({ session, token }) {
      return Promise.resolve({
        ...session,
        user: token.user,
      });
    },
    async jwt({ user, account, token, trigger }) {
      if (user) {
        token.user = user as User;
      }
      if (trigger === "signIn" || trigger === "signUp") {
        if (!account?.access_token) {
          throw new Error("No access token set on account: " + user.id);
        }
        await prismaClient.account.update({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          data: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
          },
        });
      }

      return token;
    },
  },
  session: { strategy: "jwt" },
};

export default NextAuth(authOptions);
