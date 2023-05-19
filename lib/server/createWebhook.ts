import { types } from "alby-js-sdk";
import { createAlbyClient } from "lib/server/createAlbyClient";
import { logger } from "lib/server/logger";
import { prismaClient } from "lib/server/prisma";
import { CreateWebhookEndpointResponse } from "types/TempTypes";

export async function createWebhook(userId: string) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("No WEBHOOK_URL set in env");
  }

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
  const client = await createAlbyClient(userId);

  // TODO: re-add description
  const result: CreateWebhookEndpointResponse =
    await client.createWebhookEndpoint({
      url: `${webhookUrl}?userId=${userId}`,
      // description: "",
      filter_types: ["invoice.incoming.settled"],
    });
  console.log("Created webhook", result.url);
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
