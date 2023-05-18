import { captureException } from "@sentry/nextjs";
import { Client, auth, types } from "alby-js-sdk";
import { LightningAddress } from "alby-tools";
import { StatusCodes } from "http-status-codes";
import { logger } from "lib/server/logger";
import { prismaClient } from "lib/server/prisma";
import { NextRequest } from "next/server";
import { Webhook } from "svix";
export async function POST(request: NextRequest) {
  const userId: string | null = request.nextUrl.searchParams.get("userId");
  try {
    if (!userId) {
      throw new Error("No userId search param in webhook post");
    }
    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        accounts: true,
        splits: true,
      },
    });
    if (!user) {
      throw new Error("No user found matching id");
    }
    if (!user.webhookEndpointSecret) {
      throw new Error("User has no webhook endpoint secret");
    }

    let invoice: types.Invoice;
    if (process.env.VERIFY_WEBHOOK === "false") {
      invoice = await request.json();
    } else {
      const headers = {
        "svix-id": request.headers.get("svix-id") as string,
        "svix-timestamp": request.headers.get("svix-timestamp") as string,
        "svix-signature": request.headers.get("svix-signature") as string,
      };
      if (
        !headers["svix-id"] ||
        !headers["svix-timestamp"] ||
        !headers["svix-signature"]
      ) {
        throw new Error("Request missing one or more svix headers");
      }

      const wh = new Webhook(user.webhookEndpointSecret);
      invoice = wh.verify(await request.text(), headers) as types.Invoice;
    }

    if (invoice.amount > 1) {
      let accessToken = user.accounts[0].access_token as string;
      const expiresAt = user.accounts[0].expires_at as number;
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
            refresh_token: user.accounts[0].refresh_token as string,
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
            id: user.accounts[0].id,
          },
          data: {
            access_token: token.token.access_token,
            refresh_token: token.token.refresh_token,
            expires_at: Math.floor(token.token.expires_at / 1000),
          },
        });
        console.log("Updated access token");
        accessToken = token.token.access_token as string;
      }

      const client = new Client(accessToken, {
        base_url: "https://api.getalby.com",
      });

      for (const split of user.splits) {
        const splitAmount = Math.floor(
          invoice.amount * (split.percentage / 100)
        );
        const fee = Math.ceil(splitAmount / 100);
        const amountMinusFee = splitAmount - fee;
        if (amountMinusFee < 1) {
          logger.info("Skipped split payment (amount too small)", {
            userId,
            splitId: split.id,
            splitAmount,
          });
          continue;
        }

        const lightningAddress = new LightningAddress(
          split.recipientLightningAddress
        );
        await lightningAddress.fetch();
        const splitInvoice = await lightningAddress.requestInvoice({
          satoshi: amountMinusFee,
          comment: "ZapSplitter sats",
        });
        const result = await client.sendPayment({
          invoice: splitInvoice.paymentRequest,
        });
        console.log("Payment result: ", result);
        logger.info("Sent split to", {
          recipientLightningAddress: split.recipientLightningAddress,
          amountMinusFee,
        });
      }
    }

    return new Response(undefined, {
      status: StatusCodes.NO_CONTENT,
    });
  } catch (error) {
    captureException(error);
    logger.error("Failed to handle webhook", { error, userId });
    return new Response("Failed to handle webhook", {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}
