import { captureException } from "@sentry/nextjs";
import { Client, auth, types } from "alby-js-sdk";
import { LightningAddress } from "alby-tools";
import { StatusCodes } from "http-status-codes";
import { createAlbyClient } from "lib/server/createAlbyClient";
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

    // TODO: prevent "infinite" loops A=>A=>A or A=>B=>A

    /*const payment = await prismaClient.incomingPayment.create({
        data: {
          userId,
          invoice.
        }
      })*/
    const client = await createAlbyClient(user.id);

    for (const split of user.splits) {
      try {
        const splitAmount = Math.floor(
          invoice.amount * (split.percentage / 100)
        );
        const fee = split.recipientLightningAddress.endsWith("@alby.com")
          ? 0
          : Math.ceil(splitAmount / 100);
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
          payerdata: {
            zapSplitterPaymentId: "TODO",
          },
        });
        const result = await client.sendPayment({
          invoice: splitInvoice.paymentRequest,
        });
        console.log("Payment result: ", result);
        logger.info("Successfully sent split payment", {
          userId,
          recipientLightningAddress: split.recipientLightningAddress,
          amountMinusFee,
        });
      } catch (error) {
        captureException(error);
        logger.error("Failed to send split payment", { error, userId });
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
