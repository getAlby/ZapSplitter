import { Client, auth } from "alby-js-sdk";
import { prismaClient } from "lib/server/prisma";

export async function createAlbyClient(userId: string) {
  const account = await prismaClient.account.findFirst({
    where: {
      userId,
    },
  });
  if (!account) {
    throw new Error("No account associated with user " + userId);
  }

  let accessToken = account.access_token as string;
  const expiresAt = account.expires_at as number;
  if (
    expiresAt <= Math.floor(Date.now() / 1000) + 1 ||
    process.env.FORCE_NEW_ACCESS_TOKEN === "true"
  ) {
    const authClient = new auth.OAuth2User({
      client_id: process.env.ALBY_OAUTH_CLIENT_ID!,
      client_secret: process.env.ALBY_OAUTH_CLIENT_SECRET,
      callback: "unused",
      scopes: [],
      token: {
        refresh_token: account.refresh_token as string,
      },
    } as auth.OAuth2UserOptions);
    const token = await authClient.refreshAccessToken();
    if (
      !token.token.access_token ||
      !token.token.refresh_token ||
      !token.token.expires_at
    ) {
      throw new Error("Failed to refresh access token");
    }
    await prismaClient.account.update({
      where: {
        id: account.id,
      },
      data: {
        access_token: token.token.access_token,
        refresh_token: token.token.refresh_token,
        expires_at: Math.floor(token.token.expires_at / 1000),
      },
    });
    // console.log("Updated access token");
    accessToken = token.token.access_token as string;
  }

  return new Client(accessToken, {
    base_url: "https://api.getalby.com",
  });
}
