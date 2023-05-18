import { Client, types } from "alby-js-sdk";
import { logger } from "lib/server/logger";
import { prismaClient } from "lib/server/prisma";

export async function createWebhook(userId: string, accessToken: string) {
  const user = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new Error("No user found for id " + userId);
  }
  if (user.webhookEndpointId) {
    logger.info("User already has webhook", { userId });
    return;
  }

  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("No WEBHOOK_URL set in env");
  }

  const client = new Client(accessToken, {
    base_url: "https://api.getalby.com",
  });
  const result: types.CreateWebhookEndpointResponse =
    await client.createWebhookEndpoint({
      url: `${webhookUrl}?userId=${userId}`,
      description: "",
      filter_types: ["invoice.incoming.settled"],
    });
  console.log("Created webhook", result);
  await prismaClient.user.update({
    where: {
      id: userId,
    },
    data: {
      webhookEndpointId: result.id,
      webhookEndpointSecret: result.endpoint_secret,
    },
  });
}
